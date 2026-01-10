import { connectDB, disconnectDB, getDB } from "./config/db.js";

async function listAllBloodBanksWithUsers() {
    try {
        await connectDB();
        const db = getDB();

        console.log("\n=== BLOOD BANKS & THEIR USERS ===\n");

        // Find all blood bank organizations
        const bloodBanks = await db.collection("organizations").find({
            type: "bloodbank"
        }).toArray();

        if (bloodBanks.length === 0) {
            console.log("❌ No blood banks found in database!\n");
            await disconnectDB();
            return;
        }

        console.log(`Found ${bloodBanks.length} blood bank(s):\n`);

        for (const bb of bloodBanks) {
            console.log(`📍 ${bb.name || 'Unnamed Blood Bank'}`);
            console.log(`   Organization Code: ${bb.organizationCode}`);
            console.log(`   Email: ${bb.email || 'N/A'}`);
            console.log(`   City: ${bb.location?.city || bb.city || 'N/A'}`);
            console.log(`   Status: ${bb.status || bb.verificationStatus || 'N/A'}`);
            console.log(`   ID: ${bb._id}`);

            // Find users for this organization
            const users = await db.collection("organizationUsers").find({
                organizationCode: bb.organizationCode
            }).toArray();

            if (users.length === 0) {
                console.log(`   ⚠️  NO USERS FOUND - Cannot login to this blood bank!`);
            } else {
                console.log(`   ✅ Users (${users.length}):`);
                users.forEach(u => {
                    console.log(`      - Email: ${u.email}`);
                    console.log(`        Role: ${u.role}`);
                    console.log(`        Status: ${u.status}`);
                });
            }
            console.log("");
        }

        console.log("=== SUMMARY ===");
        console.log(`Total Blood Banks: ${bloodBanks.length}`);

        const banksWithUsers = [];
        for (const bb of bloodBanks) {
            const userCount = await db.collection("organizationUsers").countDocuments({
                organizationCode: bb.organizationCode
            });
            if (userCount > 0) {
                banksWithUsers.push(bb);
            }
        }

        console.log(`Blood Banks with Users: ${banksWithUsers.length}`);
        console.log(`Blood Banks without Users: ${bloodBanks.length - banksWithUsers.length}\n`);

        if (banksWithUsers.length === 0) {
            console.log("⚠️  WARNING: No blood banks have users!");
            console.log("You need to create users for your blood banks to be able to login.\n");
        }

        await disconnectDB();

    } catch (error) {
        console.error("❌ Error:", error.message);
        await disconnectDB();
        process.exit(1);
    }
}

listAllBloodBanksWithUsers();
