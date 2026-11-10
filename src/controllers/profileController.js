const { getCollection } = require("../config/db");

// Get logged-in user's profile (Protected)
const getMyProfile = async (req, res) => {
  try {
    const userProfilesCollection = getCollection("userProfiles");
    const authUsersCollection = getCollection("user"); // BetterAuth main user collection

    // Profile data + BetterAuth user data (একসাথে)
    const [profile, authUser] = await Promise.all([
      userProfilesCollection.findOne({ userId: req.user.id }),
      authUsersCollection.findOne(
        { email: req.user.email },
        { projection: { emailVerified: 1, createdAt: 1 } }
      ),
    ]);

    const userProfile = {
      id: req.user.id,
      name: req.user.name || "",
      email: req.user.email,
      role: req.user.role || "user",

      dateOfBirth: profile?.dateOfBirth || "",
      gender: profile?.gender || "",
      bio: profile?.bio || "",
      phone: profile?.phone || "",

      location: profile?.location || {
        division: "",
        district: "",
        upazila: "",
        postalCode: "",
      },

      interests: profile?.interests || [],

      // Profile Images
      image: profile?.image || null,
      coverImage: profile?.coverImage || null,

      // Account & Security (BetterAuth user collection থেকে)
      emailVerified: Boolean(authUser?.emailVerified),
      accountCreatedAt: authUser?.createdAt || null,

      // Profile document-এর তারিখ (আগের মতোই)
      createdAt: profile?.createdAt || null,
      updatedAt: profile?.updatedAt || null,
    };

    res.status(200).json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error("Failed to Fetch Profile:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile!",
    });
  }
};

// Update logged-in user's profile (Protected)
const updateMyProfile = async (req, res) => {
  try {
    const { dateOfBirth, gender, bio, phone, location, interests } = req.body;

    const userProfilesCollection = getCollection("userProfiles");

    const updateData = {
      userId: req.user.id,

      dateOfBirth: dateOfBirth || "",
      gender: gender || "",
      bio: bio || "",
      phone: phone || "",

      location: {
        division: location?.division || "",
        district: location?.district || "",
        upazila: location?.upazila || "",
        postalCode: location?.postalCode || "",
      },

      interests: Array.isArray(interests) ? interests : [],

      updatedAt: new Date(),
    };

    await userProfilesCollection.updateOne(
      { userId: req.user.id },
      {
        $set: updateData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Failed to Update Profile:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update profile!",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};