import Community from '../Models/Community.js';
import mongoose from 'mongoose';
import UserModel from '../Models/UserModel.js';
import Notification from '../Models/Notification.js'; // Import Notification model

const Post = {
    find: (query) => ({
        sort: () => ({
            limit: () => ([{ title: "Mock Discussion", community: query.communityId || query.communitySlug }])
        })
    })
};

// **Updated Helper function** to execute a query (by ID, then by Slug) and apply Mongoose query options.
const findCommunity = async (idOrSlug, populateOptions = null, selectOptions = null) => {

    // Helper to build and execute a query with population/selection options
    const executeQuery = (condition) => {
        let query = Community.findOne(condition);
        if (populateOptions) query.populate(populateOptions);
        if (selectOptions) query.select(selectOptions);
        return query.exec();
    };

    let community = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    // Attempt 1: Search by ID if the input looks like an ObjectId
    if (isObjectId) {
        community = await executeQuery({ _id: idOrSlug });
    }

    // Attempt 2: If the first attempt failed, or the input was not a valid ObjectId, search by slug
    if (!community) {
        community = await executeQuery({ slug: idOrSlug });
    }

    return community;
};

// @desc    Get communities the user is a member of
// @route   GET /api/v1/communities/my-communities
// @access  Private (protect)
const getUserCommunities = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find communities where the user's ID is in the members array
        const communities = await Community.find({
            'members.user': userId,
            isActive: true,
            visibility: { $ne: 'hidden' }
        })
            .select('-bannedUsers -rules') // Exclude sensitive fields
            .populate({
                path: 'admin',
                select: 'username avatar'
            });

        if (!communities || communities.length === 0) {
            // Returns 200 with empty array if no communities joined (NOT a 404)
            return res.status(200).json({
                success: true,
                message: 'You have not joined any communities yet.',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            count: communities.length,
            data: communities
        });
    } catch (error) {
        // Log the error for this specific route
        console.error('Error fetching user communities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching user communities.' });
    }
};

// @desc    Get newly created communities (popular by newness)
// @route   GET /api/v1/communities/popular
// @access  Public
const getPopularCommunities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const popularCommunities = await Community.find({
            isActive: true,
            visibility: 'public'
        })
            .sort({ memberCount: -1, createdAt: -1 }) // Sort by members then by creation date
            .limit(limit)
            .select('-bannedUsers -rules -members') // Exclude sensitive/large fields
            .populate({
                path: 'admin',
                select: 'username avatar'
            });

        res.status(200).json({
            success: true,
            count: popularCommunities.length,
            data: popularCommunities
        });
    } catch (error) {
        console.error('Error fetching popular communities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching popular communities.' });
    }
};

const getDiscoverableCommunities = async (req, res) => {
    try {

        const userIdString = req.params.userId || req.query.userId;

        if (!userIdString) {
            return res.status(400).json({ success: false, message: 'User ID is required for discoverable communities.' });
        }

        // Convert the string userId to a Mongoose ObjectId
        const userId = new mongoose.Types.ObjectId(userIdString);

        const limit = parseInt(req.query.limit) || 20;

        // Filter criteria - show all public active communities that user hasn't joined
        const filter = {
            isActive: true,
            visibility: 'public',
            // Exclude communities where user is already a member or admin
            'members.user': { $nin: [userId] },
            admin: { $nin: [userId] }
        };

        const discoverableCommunities = await Community.find(filter)
            .limit(limit)
            .select('-bannedUsers -rules ')
            .populate({
                path: 'admin',
                select: 'username avatar'
            });

        res.status(200).json({
            success: true,
            count: discoverableCommunities.length,
            data: discoverableCommunities
        });
    } catch (error) {
        console.error('Error fetching discoverable communities:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ success: false, message: 'Invalid User ID format.' });
        }
        res.status(500).json({ success: false, message: 'Server error fetching discoverable communities.' });
    }
};
// @desc    Get recommended communities based on user interests
// @route   GET /api/v1/communities/recommended
// @access  Private (protect)
const getRecommendedCommunities = async (req, res) => {
    try {
        const userId = req.user._id;
        // In a real scenario, req.user would already contain interests from the auth middleware lookup.
        const user = req.user;
        const userInterests = user.interests || [];

        console.log('User Interests:', userInterests);

        if (userInterests.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No interests found. Please update your profile to get recommendations.',
                data: []
            });
        }

        const communities = await Community.find({
            // FIX: Use $in to match communities that share ANY of the user's interests.
            categories: { $in: userInterests },
            // Ensure the user is NOT already a member
            'members.user': { $ne: userId },
            isActive: true,
            visibility: 'public'
        })
            .limit(10)
            .sort({ memberCount: -1 }) // Recommend more active communities
            .select('-bannedUsers -rules -members')
            .populate({
                path: 'admin',
                select: 'username avatar'
            });

        res.status(200).json({
            success: true,
            count: communities.length,
            data: communities
        });
    } catch (error) {
        console.error('Error fetching recommended communities:', error);
        res.status(500).json({ success: false, message: 'Server error fetching recommended communities.' });
    }
};

// @desc    Create a new community
// @route   POST /api/v1/communities/create
// @access  Private (protect)
const createCommunity = async (req, res) => {
    try {
        const { name, description, categories, isPrivate } = req.body;
        const userId = req.user._id;

        // 1. Basic Validation
        if (!name || !description || !categories) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, description, and categories.'
            });
        }

        // Ensure categories is an array
        const categoryArray = Array.isArray(categories) ? categories : [categories];

        // 2. File Upload Path (from middleware)
        let coverImage = null;
        if (req.file) {
            // Store the path relative to the server root (e.g., /uploads/filename.jpg)
            coverImage = `/uploads/${req.file.filename}`;
        }

        // 3. Parse isPrivate (comes as string from FormData)
        const isPrivateBool = isPrivate === 'true' || isPrivate === true;

        // 4. Create Community
        const newCommunity = await Community.create({
            name,
            description,
            categories: categoryArray,
            coverImage,
            isPrivate: isPrivateBool,
            visibility: isPrivateBool ? 'private' : 'public',
            admin: userId,
            // Automatically make the creator the first member (as an admin)
            members: [{ user: userId, role: 'admin' }],
            memberCount: 1, // Initialize member count
        });

        // 4. Update User's profile to include the new community in joinedCommunities
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { joinedCommunities: newCommunity._id }
        }, { new: true });

        // 5. Create notification for community creation
        await Notification.create({
            user: userId,
            type: 'community',
            title: '🎉 Community Created!',
            message: `Your community "${name}" has been successfully created. Start inviting members!`,
            data: {
                communityId: newCommunity._id,
                communityName: name,
                communitySlug: newCommunity.slug,
                createdAt: new Date()
            }
        });

        res.status(201).json({
            success: true,
            message: 'Community created successfully.',
            data: newCommunity
        });
    } catch (error) {
        console.error('Error creating community:', error);

        if (error.code === 11000) { // Duplicate key error (name/slug)
            return res.status(400).json({
                success: false,
                message: 'A community with this name already exists.'
            });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors).map(val => val.message).join(', ');
            return res.status(400).json({ success: false, message: message });
        }

        res.status(500).json({ success: false, message: 'Server error during community creation.' });
    }
};

// @desc    Get detailed community information
// @route   GET /api/v1/communities/:idOrSlug
// @access  Public
const getCommunityInformation = async (req, res) => {
    try {
        const { idOrSlug } = req.params;

        // Pass options to the helper instead of chaining them outside.
        const community = await findCommunity(
            idOrSlug,
            { path: 'admin', select: 'username avatar email' }, // populateOptions
            '-bannedUsers' // selectOptions
        );

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // Check if user is admin or member - safely handle both string and object IDs
        let isUserAdmin = false;
        let isUserMember = false;

        if (req.user) {
            const userId = req.user._id?.toString ? req.user._id.toString() : req.user._id;

            // Check admin - handle both populated object and string ID
            if (community.admin) {
                const adminId = community.admin._id
                    ? community.admin._id.toString()
                    : community.admin.toString();
                isUserAdmin = adminId === userId;
            }

            // Check membership
            isUserMember = community.members?.some(m => {
                const memberId = m.user?._id
                    ? m.user._id.toString()
                    : (m.user?.toString ? m.user.toString() : m.user);
                return memberId === userId;
            });
        }

        // For private communities, return limited info if user is NOT admin or member
        if (community.visibility === 'private' && !isUserAdmin && !isUserMember) {
            // Return limited community data for private communities
            return res.status(200).json({
                success: true,
                data: {
                    _id: community._id,
                    name: community.name,
                    description: community.description,
                    slug: community.slug,
                    coverImage: community.coverImage,
                    icon: community.icon,
                    isPrivate: true,
                    visibility: 'private',
                    memberCount: community.memberCount,
                    categories: community.categories,
                    admin: community.admin,
                    createdAt: community.createdAt,
                    // Don't include members list, posts, etc.
                    members: [],
                    rules: []
                }
            });
        }

        res.status(200).json({
            success: true,
            data: community
        });
    } catch (error) {
        console.error('Error fetching community information:', error);
        res.status(500).json({ success: false, message: 'Server error fetching community information.' });
    }
};

// @desc    Get all discussions/posts inside a community
// @route   GET /api/v1/communities/:idOrSlug/discussions
// @access  Public (Visibility checks should be done here)
const getAllDiscussionsInCommunity = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const community = await findCommunity(idOrSlug);

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // Visibility check (simplified)
        if (community.visibility === 'private' &&
            (!req.user || !community.isMember(req.user._id))
        ) {
            return res.status(403).json({ success: false, message: 'Access denied. Join the community to see discussions.' });
        }

        // --- Mock Fetching Discussions (Assuming a Post/Discussion model) ---
        // Find all posts associated with this community ID
        const posts = await Post.find({ community: community._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // In a real application, you would also fetch the total count for pagination
        res.status(200).json({
            success: true,
            community: { _id: community._id, name: community.name, slug: community.slug },
            page,
            limit,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching community discussions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching discussions.' });
    }
};

// @desc    Allows a user to join a community
// @route   POST /api/v1/communities/:idOrSlug/join
// @access  Private (protect)
const joinCommunity = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        // User ID is available from the protect middleware
        const userId = req.user._id;
        const username = req.user.username;

        const community = await findCommunity(idOrSlug);

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // Check if user is banned
        if (community.isBanned(userId)) {
            return res.status(403).json({ success: false, message: 'You are banned from joining this community.' });
        }

        // Check if user is already a member
        if (community.isMember(userId)) {
            return res.status(400).json({ success: false, message: 'You are already a member of this community.' });
        }

        // Handle private community request - check both isPrivate and visibility
        if (community.isPrivate || community.visibility === 'private') {
            // Check if user has a valid invitation
            const validInvite = await Notification.findOne({
                user: userId,
                type: 'COMMUNITY_INVITE',
                'data.communityId': community._id,
                read: false // Unread invitations are considered active
            });

            if (!validInvite) {
                // No valid invitation found - block access
                return res.status(403).json({
                    success: false,
                    message: 'This is a private community. You can only join if invited by an admin or moderator.'
                });
            }

            // Mark the invitation as read (accepted)
            validInvite.read = true;
            await validInvite.save();
        }

        // 1. Add user to community's member list and update memberCount
        await community.addMember(userId);

        // 2. Update User's joinedCommunities array (MANDATORY UPDATE)
        // Use $addToSet to add the community ID, ensuring no duplicates.
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { joinedCommunities: community._id }
        }, { new: true });

        // 3. Create notification for user joining community
        await Notification.create({
            user: userId,
            type: 'welcome',
            title: '✅ Joined Community!',
            message: `Welcome to "${community.name}"! You are now a member.`,
            data: {
                communityId: community._id,
                communityName: community.name,
                communitySlug: community.slug,
                memberCount: community.memberCount,
                joinedAt: new Date()
            }
        });

        // 4. OPTIONAL: Notify community admin about new member
        if (community.admin && community.admin.toString() !== userId.toString()) {
            await Notification.create({
                user: community.admin,
                type: 'info',
                title: '👥 New Member Joined',
                message: `${username || 'A user'} has joined your community "${community.name}".`,
                data: {
                    communityId: community._id,
                    communityName: community.name,
                    newMemberId: userId,
                    newMemberName: username,
                    memberCount: community.memberCount
                }
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully joined community: ${community.name}`,
            data: {
                _id: community._id,
                slug: community.slug,
                memberCount: community.memberCount
            }
        });
    } catch (error) {
        console.error('Error joining community:', error);
        // Catch the explicit error from addMember if it somehow gets bypassed
        if (error.message === 'User is already a member') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error while joining community.' });
    }
};

// @desc    Invite a user to a community via email
// @route   POST /api/v1/communities/:idOrSlug/invite
// @access  Private (protect, only accessible by admins/moderators)
const inviteMember = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const { email: invitedUserEmail } = req.body;
        const invitingUserId = req.user._id;
        const invitingUsername = req.user.username;

        // 1. Find the Community
        const community = await findCommunity(idOrSlug);

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // 2. Authorization Check (only community admins/moderators can invite)
        const userMember = community.members.find(m => m.user.toString() === invitingUserId.toString());
        if (!userMember || (userMember.role !== 'admin' && userMember.role !== 'moderator')) {
            return res.status(403).json({ success: false, message: 'Only admins or moderators can send invitations.' });
        }

        // 3. Find the User to be Invited
        const invitedUser = await UserModel.findOne({ email: invitedUserEmail });

        if (!invitedUser) {
            // OPTIONAL: Send a system email to the email address if they don't exist
            // For now, we only allow inviting existing users.
            return res.status(404).json({ success: false, message: 'User with this email not found on the platform.' });
        }

        // 4. Check if the invited user is already a member
        if (community.isMember(invitedUser._id)) {
            return res.status(400).json({ success: false, message: `The user ${invitedUserEmail} is already a member of ${community.name}.` });
        }

        // 5. Check if an active invitation already exists for this user/community
        const existingInvite = await Notification.findOne({
            user: invitedUser._id,
            type: 'COMMUNITY_INVITE',
            'data.communityId': community._id,
            read: false // Assuming unread notifications are active invites
        });

        if (existingInvite) {
            return res.status(400).json({ success: false, message: `An invitation has already been sent to ${invitedUserEmail}.` });
        }


        // 6. Create the Invitation Notification
        await Notification.create({
            user: invitedUser._id,
            type: 'COMMUNITY_INVITE',
            title: `Invitation to Join ${community.name}`,
            message: `${invitingUsername} has invited you to join the community: ${community.name}.`,
            data: {
                communityId: community._id,
                communityName: community.name,
                communitySlug: community.slug,
                inviter: {
                    id: invitingUserId,
                    username: invitingUsername
                },
                invitedAt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: `Invitation successfully sent to ${invitedUserEmail}.`
        });

    } catch (error) {
        console.error('Error inviting member:', error);
        res.status(500).json({ success: false, message: 'Server error while sending invitation.' });
    }
};

// @desc    Update community information (by admin/creator)
// @route   PATCH /api/v1/communities/:idOrSlug
// @access  Private (protect, only accessible by community admin)
const updateCommunity = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const { name, description, categories, isPrivate } = req.body;
        const userId = req.user._id;

        // 1. Find the Community
        const community = await findCommunity(idOrSlug);

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // 2. Authorization Check - only community admin can update
        if (!community.isAdmin(userId)) {
            return res.status(403).json({ success: false, message: 'Only the community creator can edit community information.' });
        }

        // 3. Update fields if provided
        if (name && name !== community.name) {
            community.name = name;
        }
        if (description) {
            community.description = description;
        }
        if (categories) {
            community.categories = Array.isArray(categories) ? categories : [categories];
        }
        if (typeof isPrivate === 'boolean') {
            community.isPrivate = isPrivate;
            community.visibility = isPrivate ? 'private' : 'public';
        }

        // Handle cover image update if file is uploaded
        if (req.file) {
            community.coverImage = `/uploads/${req.file.filename}`;
        }

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

// @desc    Allows a user to leave a community
// @route   POST /api/v1/communities/:idOrSlug/leave
// @access  Private (protect)
const leaveCommunity = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        // User ID is available from the protect middleware
        const userId = req.user._id;
        const username = req.user.username;

        // 1. Find the Community
        const community = await findCommunity(idOrSlug);

        if (!community) {
            return res.status(404).json({ success: false, message: 'Community not found.' });
        }

        // 2. Check if the user is a member
        if (!community.isMember(userId)) {
            return res.status(400).json({ success: false, message: 'You are not a member of this community.' });
        }

        // 3. Prevent admin from leaving if they are the ONLY member
        if (community.isAdmin(userId) && community.memberCount === 1) {
            return res.status(403).json({
                success: false,
                message: 'As the sole admin, you must delete the community or transfer admin rights before leaving.'
            });
        }

        // 4. Remove user from community's member list and update memberCount
        // This method is defined in your Community Model methods
        await community.removeMember(userId);

        // 5. Update User's joinedCommunities array
        // Use $pull to remove the community ID from the array.
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { joinedCommunities: community._id }
        }, { new: true });

        // 6. Create notification for user leaving community
        await Notification.create({
            user: userId,
            type: 'info',
            title: '👋 Left Community',
            message: `You have successfully left "${community.name}".`,
            data: {
                communityId: community._id,
                communityName: community.name,
                communitySlug: community.slug,
                leftAt: new Date()
            }
        });

        // 7. OPTIONAL: Notify community admin about the member leaving
        if (community.admin && community.admin.toString() !== userId.toString()) {
            await Notification.create({
                user: community.admin,
                type: 'info',
                title: '👤 Member Left',
                message: `${username || 'A user'} has left your community "${community.name}".`,
                data: {
                    communityId: community._id,
                    communityName: community.name,
                    leftMemberId: userId,
                    leftMemberName: username,
                    memberCount: community.memberCount // The updated count after removal
                }
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully left community: ${community.name}`,
            data: {
                _id: community._id,
                slug: community.slug,
                memberCount: community.memberCount
            }
        });
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({ success: false, message: 'Server error while leaving community.' });
    }
};

export {
    getUserCommunities,
    getPopularCommunities,
    getRecommendedCommunities,
    createCommunity,
    getCommunityInformation,
    getAllDiscussionsInCommunity,
    joinCommunity,
    inviteMember,
    updateCommunity,
    getDiscoverableCommunities,
    leaveCommunity
};