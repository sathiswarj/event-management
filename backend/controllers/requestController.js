import Request from '../models/Request.js';
import axios from 'axios';
import { generateEmbedding } from '../services/geminiService.js';

// Helper to mark overlapping requests as Date Conflict
const handleDateConflicts = async (eventDate, approvedRequestId) => {
    // Strictly extract the YYYY-MM-DD to ignore time and timezone shifts
    const dateStr = typeof eventDate === 'string' ? eventDate.split('T')[0] : new Date(eventDate).toISOString().split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    await Request.updateMany({
        _id: { $ne: approvedRequestId },
        eventDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'Pending'
    }, {
        $set: { status: 'Date Conflict', dateConflict: true }
    });
};

// @desc    Create a request
// @route   POST /api/requests
// @access  Public
export const createRequest = async (req, res, next) => {
    try {
        // Only extract what the frontend BookNow.jsx actually sends
        const { title, description, categoryId, eventDate } = req.body;

        // 1. Check MongoDB for existing approved/confirmed request on the same date (Timezone-aware)
        const submittedDate = new Date(eventDate);
        const conflictingEvent = await Request.findOne({
            $expr: {
                $eq: [
                    // Format the DB date to YYYY-MM-DD in IST (+05:30)
                    { $dateToString: { format: "%Y-%m-%d", date: "$eventDate", timezone: "+05:30" } },
                    // Format the submitted date to YYYY-MM-DD in IST (+05:30)
                    { $dateToString: { format: "%Y-%m-%d", date: submittedDate, timezone: "+05:30" } }
                ]
            },
            status: { $regex: /^(approved|confirmed)$/i }
        });

        const hasConflict = !!conflictingEvent;
        const status = hasConflict ? 'Date Conflict' : 'Pending';

        // 2. Generate unique requestId: REQ-YYYYMMDD-XXXX
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const requestId = `REQ-${yyyy}${mm}${dd}-${randomDigits}`;

        // 3. Generate Embedding
        let embedding = [];
        try {
            const textToEmbed = `Title: ${title}. Description: ${description}. Category ID: ${categoryId}. Date: ${eventDate}`;
            embedding = await generateEmbedding(textToEmbed);
        } catch (err) {
            console.error('Failed to generate embedding during request creation:', err);
        }

        // 4. Save the new request to MongoDB immediately
        const request = await Request.create({
            requestId,
            title,
            description,
            categoryId,
            eventDate,
            status,
            statusHistory: [{ status, updatedAt: new Date() }],
            dateConflict: hasConflict,
            userId: req.user ? req.user.userId : null,
            embedding: embedding.length > 0 ? embedding : undefined
        });

        // 4 & 5. Send webhook in a try/catch
        try {
            const webhookUrl = process.env.N8N_WEBHOOK_URL;
            if (webhookUrl) {
                // Populate user details so we can send them to the webhook without needing them in req.body
                await request.populate('category', 'name');
                await request.populate('user', 'name email phone');

                const payload = {
                    requestId,
                    customerName: request.user ? request.user.name : null,
                    customerEmail: request.user ? request.user.email : null,
                    customerPhone: request.user ? request.user.phone : null,
                    title,
                    eventDate,
                    category: request.category ? request.category.name : null,
                    description,
                    dateConflict: hasConflict
                };

                await axios.post(webhookUrl, payload);
            }
        } catch (webhookError) {
            console.log('Webhook error:', webhookError.message);
        }

        // 6 & 7. Return created request object as JSON with status 201
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({}).populate('category', 'name').populate('user', 'name email phone telegramChatId').sort('-createdAt');
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user's requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ userId: req.user.userId }).populate('category', 'name').populate('user', 'name email phone telegramChatId').sort('-createdAt');
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Public
export const getRequestById = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Find by _id (if valid ObjectId) or by requestId
        const query = id.match(/^[0-9a-fA-F]{24}$/)
            ? { $or: [{ _id: id }, { requestId: id }] }
            : { requestId: id };

        const request = await Request.findOne(query).populate('category', 'name').populate('user', 'name email phone telegramChatId');

        if (request) {
            res.status(200).json(request);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update request status/notes
// @route   PUT /api/requests/:id
// @access  Private/Admin
export const updateRequest = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;

        const updateQuery = { $set: {} };
        if (status) {
            updateQuery.$set.status = status;
            updateQuery.$push = {
                statusHistory: {
                    status: status,
                    updatedAt: new Date()
                }
            };
        }
        if (adminNotes !== undefined) updateQuery.$set.adminNotes = adminNotes;

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true }
        );

        if (updatedRequest) {
            // Check if we need to trigger Date Conflict for other pending requests
            if (['Approved', 'Confirmed', 'Completed'].includes(updatedRequest.status)) {
                await handleDateConflicts(updatedRequest.eventDate, updatedRequest._id);
            }

            // n8n Webhook Integration for Status Update
            if (status) {
                try {
                    const statusWebhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
                    if (statusWebhookUrl) {
                        await updatedRequest.populate('user', 'name email phone telegramChatId');
                        const payload = {
                            type: 'status_update',
                            requestId: updatedRequest.requestId || updatedRequest._id,
                            customerName: updatedRequest.user ? updatedRequest.user.name : null,
                            customerEmail: updatedRequest.user ? updatedRequest.user.email : null,
                            telegramChatId: updatedRequest.user ? updatedRequest.user.telegramChatId : null,
                            title: updatedRequest.title,
                            eventDate: updatedRequest.eventDate,
                            status: updatedRequest.status
                        };
                        await axios.post(statusWebhookUrl, payload);
                    }
                } catch (webhookError) {
                    console.error('Failed to send status webhook to n8n:', webhookError.message);
                }
            }

            res.status(200).json(updatedRequest);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Admin sends a quotation PDF
// @route   POST /api/requests/:id/send-quotation
// @access  Private (Admin only)
export const sendQuotation = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id).populate('user', 'name email telegramChatId');
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a PDF quotation file');
        }

        // Just use local path for now, frontend will serve it from /uploads
        const quotationUrl = `/uploads/${req.file.filename}`;

        request.quotationUrl = quotationUrl;

        // Ensure array exists for older documents
        if (!request.quotationHistory) {
            request.quotationHistory = [];
        }

        request.quotationHistory.push({
            url: quotationUrl,
            uploadedAt: new Date(),
            version: request.quotationHistory.length + 1
        });
        request.status = 'Quotation Sent';
        request.statusHistory.push({ status: 'Quotation Sent', updatedAt: new Date() });

        await request.save();

        // Notify user via webhook
        try {
            const webhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
            if (webhookUrl) {
                // Construct absolute URL so N8N can fetch the PDF
                const absoluteQuotationUrl = `http://localhost:5000${quotationUrl}`;

                await axios.post(webhookUrl, {
                    type: 'quotation_ready',
                    requestId: request.requestId || request._id,
                    customerName: request.user?.name,
                    customerEmail: request.user?.email,
                    title: request.title,
                    quotationUrl: absoluteQuotationUrl,
                    status: 'Quotation Sent'
                });
            }
        } catch (webhookError) {
            console.error('Webhook error on send quotation:', webhookError.message);
        }

        res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Accept quotation / approved request
// @route   POST /api/requests/:id/accept
// @access  Private (User)
export const acceptRequest = async (req, res, next) => {
    try {
        const id = req.params.id;
        const query = id.match(/^[0-9a-fA-F]{24}$/)
            ? { $or: [{ _id: id }, { requestId: id }], userId: req.user.userId }
            : { requestId: id, userId: req.user.userId };
        const request = await Request.findOne(query);

        if (request && ['Quotation Sent', 'Approved', 'Pending Response'].includes(request.status)) {
            request.status = 'Confirmed';
            request.statusHistory.push({ status: 'Confirmed', updatedAt: new Date() });
            await request.save();
            await handleDateConflicts(request.eventDate, request._id);

            // Notify admin via webhook
            try {
                const webhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
                if (webhookUrl) {
                    await request.populate('user', 'name email telegramChatId');
                    await axios.post(webhookUrl, {
                        type: 'user_accepted',
                        requestId: request.requestId || request._id,
                        customerName: request.user?.name,
                        title: request.title,
                        eventDate: request.eventDate,
                        status: 'Confirmed'
                    });
                }
            } catch (webhookError) {
                console.error('Webhook error on accept:', webhookError.message);
            }

            res.status(200).json(request);
        } else {
            res.status(404);
            throw new Error('Request not found or cannot be accepted');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reject quotation
// @route   POST /api/requests/:id/reject
// @access  Private (User)
export const rejectRequest = async (req, res, next) => {
    try {
        const id = req.params.id;
        const query = id.match(/^[0-9a-fA-F]{24}$/)
            ? { $or: [{ _id: id }, { requestId: id }], userId: req.user.userId }
            : { requestId: id, userId: req.user.userId };
        const request = await Request.findOne(query);

        if (request && ['Quotation Sent', 'Approved', 'Pending Response'].includes(request.status)) {
            request.status = 'Rejected';
            request.statusHistory.push({ status: 'Rejected', updatedAt: new Date() });
            await request.save();

            // Notify admin via webhook
            try {
                const webhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
                if (webhookUrl) {
                    await request.populate('user', 'name email telegramChatId');
                    await axios.post(webhookUrl, {
                        type: 'user_rejected',
                        requestId: request.requestId || request._id,
                        customerName: request.user?.name,
                        title: request.title,
                        eventDate: request.eventDate,
                        status: 'Rejected'
                    });
                }
            } catch (webhookError) {
                console.error('Webhook error on reject:', webhookError.message);
            }

            res.status(200).json(request);
        } else {
            res.status(404);
            throw new Error('Request not found or cannot be rejected');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    User sends a negotiation message
// @route   POST /api/requests/:id/negotiate
// @access  Private (User)
export const negotiateRequest = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            res.status(400);
            throw new Error('Message is required');
        }

        const id = req.params.id;
        const query = id.match(/^[0-9a-fA-F]{24}$/)
            ? { $or: [{ _id: id }, { requestId: id }], userId: req.user.userId }
            : { requestId: id, userId: req.user.userId };
        const request = await Request.findOne(query);

        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }

        request.negotiationMessages.push({ sender: 'user', message: message.trim(), timestamp: new Date() });
        request.status = 'Negotiation Requested';
        request.statusHistory.push({ status: 'Negotiation Requested', updatedAt: new Date() });
        await request.save();

        // Notify admin via webhook
        try {
            const webhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
            if (webhookUrl) {
                await request.populate('user', 'name email telegramChatId');
                await axios.post(webhookUrl, {
                    type: 'negotiation_message',
                    requestId: request.requestId || request._id,
                    customerName: request.user?.name,
                    customerEmail: request.user?.email,
                    title: request.title,
                    negotiationMessage: message.trim(),
                    status: 'Negotiation Requested'
                });
            }
        } catch (webhookError) {
            console.error('Webhook error on negotiate:', webhookError.message);
        }

        res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Admin sends a reply in the negotiation thread
// @route   POST /api/requests/:id/admin-reply
// @access  Private (Admin only)
export const adminReplyRequest = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            res.status(400);
            throw new Error('Message is required');
        }

        const request = await Request.findById(req.params.id).populate('user', 'name email telegramChatId');
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }

        request.negotiationMessages.push({ sender: 'admin', message: message.trim(), timestamp: new Date() });
        request.status = 'Pending Response';
        request.statusHistory.push({ status: 'Pending Response', updatedAt: new Date() });
        await request.save();

        // Notify user via webhook
        try {
            const webhookUrl = process.env.N8N_TELEGRAM_WEBHOOK;
            if (webhookUrl) {
                await axios.post(webhookUrl, {
                    type: 'admin_negotiation_reply',
                    requestId: request.requestId || request._id,
                    customerName: request.user?.name,
                    customerEmail: request.user?.email,
                    telegramChatId: request.user?.telegramChatId,
                    title: request.title,
                    adminMessage: message.trim(),
                    status: 'Pending Response'
                });
            }
        } catch (webhookError) {
            console.error('Webhook error on admin reply:', webhookError.message);
        }

        res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};


// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
export const deleteRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id);

        if (request) {
            await request.deleteOne();
            res.status(200).json({ message: 'Request removed' });
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats
// @route   GET /api/requests/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
    try {
        // Aggregate totals by status
        const statusCounts = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        let total = 0;
        let pending = 0;
        let approved = 0;
        let completed = 0;
        let dateConflict = 0;

        statusCounts.forEach(stat => {
            total += stat.count;
            if (stat._id === 'Pending') pending = stat.count;
            if (stat._id === 'Approved') approved = stat.count;
            if (stat._id === 'Completed') completed = stat.count;
            if (stat._id === 'Date Conflict') dateConflict = stat.count;
        });

        // Aggregate by category
        const categoryCounts = await Request.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
            { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } }
        ]);

        const categoryData = categoryCounts.map(c => ({
            name: c._id || 'Uncategorized',
            value: c.count
        }));

        // Aggregate by month (for area chart)
        const currentYear = new Date().getFullYear();
        const monthCounts = await Request.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Fill all 12 months with 0 if no data, up to current month
        const currentMonth = new Date().getMonth() + 1;
        const trendData = [];

        for (let i = 1; i <= currentMonth; i++) {
            const m = monthCounts.find(m => m._id === i);
            trendData.push({
                name: monthNames[i - 1],
                requests: m ? m.count : 0
            });
        }

        res.status(200).json({
            stats: { total, pending, approved, completed, dateConflict },
            categoryData,
            trendData
        });
    } catch (error) {
        next(error);
    }
};
