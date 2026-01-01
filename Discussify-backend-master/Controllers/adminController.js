// src/Controllers/AdminController.js

import User from '../Models/UserModel.js';
import Community from '../Models/Community.js'; // Assuming you have this model
import Post from '../Models/Post.js'; // Assuming you have this model
import Notification from "../Models/Notification.js"

// =======================================================
// ANALYTICS & DASHBOARD
// =======================================================
/**
 * @desc Get application analytics (user count, community count)
 * @route GET /api/v1/admin/analytics
 * @access Private (Admin only)
 */
export const getAppAnalytics = async (req, res) => {
    try {
        const userCount = await User.countDocuments({ isActive: { $ne: false } });
        const communityCount = await Community.countDocuments({ isActive: { $ne: false } });
        const postCount = await Post.countDocuments({ isDeleted: { $ne: true } });

        // Count users created in the last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: lastWeek }, isActive: { $ne: false } });

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userCount,
                totalCommunities: communityCount,
                totalPosts: postCount,
                newUsersLastWeek: newUsersLastWeek
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
    }
};

// =======================================================
// COMMUNITY MANAGEMENT
// =======================================================

/**
 * @desc Get all communities
 * @route GET /api/v1/admin/communities
 * @access Private (Admin only)
 */
export const getAllCommunities = async (req, res) => {
    try {
        // Basic pagination and sorting
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const communities = await Community.find({ isActive: { $ne: false } })
            .select('name slug description categories isPrivate isActive coverImage admin createdAt memberCount postCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCommunities = await Community.countDocuments({ isActive: { $ne: false } });

        res.status(200).json({
            success: true,
            count: communities.length,
            total: totalCommunities,
            data: communities
        });
    } catch (error) {
        console.error('Error fetching all communities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching communities.' });
    }
};

/**
 * @desc Get discussions/posts for a specific community
 * @route GET /api/v1/admin/communities/:communityId/posts
 * @access Private (Admin only)
 */
export const getCommunityDiscussions = async (req, res) => {
    try {
        const { communityId } = req.params;

        const posts = await Post.find({ community: communityId, isDeleted: false, })
            .populate({ path: 'author', select: 'username' })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching community discussions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching discussions.' });
    }
};

// =======================================================
// USER MANAGEMENT
// =======================================================

/**
 * @desc Get all users
 * @route GET /api/v1/admin/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;


        const users = await User.find()
            .select('_id username email profileImage role isActive createdAt joinedCommunities')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'joinedCommunities',
            });

        const totalUsers = await User.countDocuments();

        res.status(200).json({
            success: true,
            count: users.length,
            total: totalUsers,
            data: users
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
};

/**
 * @desc Update user details (username, email, role, isActive)
 * @route PATCH /api/v1/admin/users/:userId
 * @access Private (Admin only)
 */

export const updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            role,
            isActive,
            bio,
            communitiesToRemove = [],
            communitiesToAdd = []
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // --- 1. ADMIN SELF-MODIFICATION GUARD ---
        if (req.user._id.toString() === userId) {
            if (role || isActive === false) {
                return res.status(403).json({ success: false, message: 'Admins cannot modify their own role or deactivate their own account via this panel.' });
            }
        }

        // --- 2. UPDATE USER FIELDS (Role, Active Status, Bio) ---
        user.role = role || user.role;
        user.bio = bio;

        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        // --- 3. HANDLE COMMUNITY REMOVALS (FIXED) 🚀 ---
        if (communitiesToRemove.length > 0) {
            // Find all communities to be removed in one go
            const communities = await Community.find({ _id: { $in: communitiesToRemove } });

            for (const comm of communities) {
                // 3a. Remove user from the Community model's members list
                if (comm.isMember(userId)) {
                    await comm.removeMember(userId);
                }
            }

            // 3b. Remove community IDs from the User model's joinedCommunities array
            user.joinedCommunities = user.joinedCommunities.filter(
                (communityId) => !communitiesToRemove.includes(communityId.toString())
            );
        }

        // --- 4. HANDLE COMMUNITY ADDITIONS (UNCHANGED) ---
        if (communitiesToAdd.length > 0) {
            const communities = await Community.find({ _id: { $in: communitiesToAdd } });

            const memberRole = user.role === 'moderator' ? 'moderator' : 'member';

            for (const comm of communities) {
                if (!comm.isMember(userId)) {

                    // --- Community Model Update ---
                    const memberEntry = { user: userId, role: memberRole };

                    if (!comm.members.some(m => m.user.toString() === userId)) {
                        comm.members.push(memberEntry);
                        await comm.updateMemberCount();
                    }

                    // --- User Model Update ---
                    if (!user.joinedCommunities.includes(comm._id)) {
                        user.joinedCommunities.push(comm._id);
                    }
                }
            }
        }

        // --- 5. SAVE USER CHANGES AND RETURN ---
        // This save now persists the changes to user.bio, user.role, user.isActive, 
        // AND the modified user.joinedCommunities array.
        await user.save({ validateBeforeSave: true });

        // Re-fetch the user with populated communities to return fresh data
        const updatedUser = await User.findById(userId)
            .select('_id username email role isActive bio createdAt joinedCommunities updatedAt profileImage') // Added profileImage for completeness
            .populate({
                path: 'joinedCommunities',
                select: '_id name slug categories',
            });

        res.status(200).json({
            success: true,
            message: 'User details updated successfully.',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error updating user details:', error);
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join('. ');
            return res.status(400).json({ success: false, message: message });
        }
        res.status(500).json({ success: false, message: 'Server error updating user details.' });
    }
};

/**
 * @desc Delete a user (hard delete)
 * @route DELETE /api/v1/admin/users/:userId
 * @access Private (Admin only)
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
            return res.status(403).json({ success: false, message: 'Admins cannot delete their own account.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Remove user from all communities they are a member of
        await Community.updateMany(
            { 'members.user': userId },
            {
                $pull: { members: { user: userId } },
                $inc: { memberCount: -1 }
            }
        );

        // Remove user from moderators lists
        await Community.updateMany(
            { moderators: userId },
            { $pull: { moderators: userId } }
        );

        // Soft delete user's posts (mark as deleted, don't remove)
        await Post.updateMany(
            { author: userId },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        // Hard delete - actually remove the user document
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error deleting user.' });
    }
};

/**
 * @desc Delete a community
 * @route DELETE /api/v1/admin/communities/:communityId
 * @access Private (Admin only)
 * NOTE: Cannot delete communities with active discussions
 */
export const deleteCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // Check for active discussions (posts)
        const activePostsCount = await Post.countDocuments({
            community: communityId,
            isDeleted: false
        });

        if (activePostsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete community with ${activePostsCount} active discussions. Please delete or archive discussions first.`
            });
        }

        // Remove community from all users' joinedCommunities before deleting
        await User.updateMany(
            { joinedCommunities: communityId },
            { $pull: { joinedCommunities: communityId } }
        );

        // Hard delete - actually remove the community document so name can be reused
        await Community.findByIdAndDelete(communityId);

        res.status(200).json({
            success: true,
            message: 'Community deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({ success: false, message: 'Server error deleting community.' });
    }
};

/**
 * @desc Update community information
 * @route PATCH /api/v1/admin/communities/:communityId
 * @access Private (Admin only)
 */
export const updateCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { name, description, categories, visibility, isActive } = req.body;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // Update fields if provided
        if (name) community.name = name;
        if (description) community.description = description;
        if (categories) community.categories = categories;
        if (visibility) community.visibility = visibility;
        if (typeof isActive === 'boolean') community.isActive = isActive;

        await community.save();

        res.status(200).json({
            success: true,
            message: 'Community updated successfully.',
            data: community
        });

    } catch (error) {
        console.error('Error updating community:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A community with this name already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error updating community.' });
    }
};

// ----------------------------------------------------
// 1. DELETE POST (Soft Delete or Hard Delete)
// We will implement a Soft Delete as it's safer for auditing.
// ----------------------------------------------------
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        // Soft Delete the post
        post.isDeleted = true;
        post.deletedAt = new Date();
        await post.save();

        // Decrement community post count
        if (post.community) {
            await Community.findByIdAndUpdate(post.community, { $inc: { postCount: -1 } });
        }

        res.status(200).json({
            success: true,
            message: `Post ${postId} soft-deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Server error during post deletion.' });
    }
};


// ----------------------------------------------------
// 2. EDIT POST CONTENT
// Allows admin to modify the title and content.
// ----------------------------------------------------
export const editPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body; // Expecting title and content from the admin's edit modal

        if (! !content) {
            return res.status(400).json({ success: false, message: 'Title or content must be provided for update.' });
        }

        const updateData = {
            editedAt: new Date(),
        };

        if (content) updateData.content = content;

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('_id title content editedAt author'); // Return essential fields

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Post updated successfully.',
            data: updatedPost
        });

    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ success: false, message: 'Server error during post editing.' });
    }
};

// ----------------------------------------------------
// 3. ADMIN ACTION ON REPORTS (Clear Reports / Mark as Reviewed)
// This endpoint assumes the admin is *reviewing* existing user reports,
// not creating a new report.
// ----------------------------------------------------
export const resolveReports = async (req, res) => {
    try {
        const { postId } = req.params;
        // Logic might vary: clear all reports, mark reviewed, etc.
        // For simplicity, we'll clear the reports array.

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: { reports: [] } }, // Clear all existing reports
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        res.status(200).json({
            success: true,
            message: `Reports for post ${postId} cleared/resolved successfully.`,
            data: updatedPost
        });

    } catch (error) {
        console.error('Error resolving post reports:', error);
        res.status(500).json({ success: false, message: 'Server error during report resolution.' });
    }
};


export const reportPostByAdmin = async (req, res) => {
    try {
        const { postId } = req.params;
        // The reason for the report is sent in the request body
        const { reason } = req.body;

        // Get the ID of the user (admin) performing the action
        const adminId = req.user._id;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'A reason for reporting the post is required.' });
        }

        const newReport = {
            user: adminId,
            reason: reason,
            reportedAt: new Date()
        };

        // Find the post and push the new report object into the reports array
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { reports: newReport }
            },
            { new: true, runValidators: true } // Return the updated document and run Mongoose schema validators
        );

        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found.' });
        }

        res.status(200).json({
            success: true,
            message: `Post ${postId} successfully reported by admin. Total reports: ${updatedPost.reports.length}`,
            data: updatedPost
        });

    } catch (error) {
        console.error('Error reporting post by admin:', error);
        res.status(500).json({ success: false, message: 'Server error during post reporting.' });
    }
};

// New Controller function for the Admin Dashboard Activity Feed
export const getRecentActivityFeed = async (req, res) => {
    try {


        // OPTIONAL: You might want to filter out 'otp' and 'welcome' if they spam the feed.
        // query.type = { $nin: ['otp', 'welcome'] }; 

        // 2. Fetch recent activities
        const { limit = 7, page = 1 } = req.query;

        // 1. Define Query (No 'user' filter for site-wide feed)
        const query = {};

        // OPTIONAL: You might want to filter out 'otp' and 'welcome' if they spam the feed.
        // query.type = { $nin: ['otp', 'welcome'] }; 

        // 2. Fetch recent activities
        const recentActivities = await Notification.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(limit * 1) // Apply limit
            .skip((page - 1) * limit) // Apply pagination skip
            .populate('user', 'username email'); // OPTIONAL: Populate the user who received the notification

        // 3. Count total (optional for a simple dashboard feed)
        // const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            activities: recentActivities,
            // pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching admin activity'
        });
    }
};