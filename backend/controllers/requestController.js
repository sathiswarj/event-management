import Request from '../models/Request.js';

// @desc    Create a request
// @route   POST /api/requests
// @access  Public
export const createRequest = async (req, res, next) => {
    try {
        const { title, description, category, customerName, customerEmail, customerPhone, eventDate } = req.body;

        const request = await Request.create({
            title,
            description,
            category,
            customerName,
            customerEmail,
            customerPhone,
            eventDate
        });

        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({}).populate('category', 'name').sort('-createdAt');
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
            
        const request = await Request.findOne(query).populate('category', 'name');

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
        
        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (updatedRequest) {
            res.status(200).json(updatedRequest);
        } else {
            res.status(404);
            throw new Error('Request not found');
        }
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

        statusCounts.forEach(stat => {
            total += stat.count;
            if (stat._id === 'Pending') pending = stat.count;
            if (stat._id === 'Approved') approved = stat.count;
            if (stat._id === 'Completed') completed = stat.count;
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
            stats: { total, pending, approved, completed },
            categoryData,
            trendData
        });
    } catch (error) {
        next(error);
    }
};
