import { connectDB, disconnectDB, getDB } from "./config/db.js";

async function listBloodBanks() {
    try {
        await connectDB();
        const db = getDB();

        console.log("\n=== BLOOD BANKS IN DATABASE ===\n");

        // Find all blood bank organizations
        const bloodBanks = await db.collection("organizations").find({
            type: "bloodbank"
        }).toArray();

        if (bloodBanks.length === 0) {
            console.log("❌ No blood banks found in database!");
            console.log("\nYou need to create blood bank organizations first.");
        } else {
            console.log(`✅ Found ${bloodBanks.length} blood bank(s):\n`);

            bloodBanks.forEach((bb, index) => {
                console.log(`${index + 1}. ${bb.name}`);
                console.log(`   Organization Code: ${bb.organizationCode}`);
                console.log(`   Email: ${bb.email}`);
                console.log(`   Status: ${bb.status || bb.verificationStatus}`);
                console.log(`   City: ${bb.location?.city || bb.city || 'N/A'}`);
                console.log(`   ID: ${bb._id}`);
                console.log("");
            });

            // Check for users
            console.log("=== CHECKING USERS ===\n");

            for (const bb of bloodBanks) {
                const users = await db.collection("organizationUsers").find({
                    organizationCode: bb.organizationCode
                }).toArray();

                if (users.length === 0) {
                    console.log(`⚠️  No users found for ${bb.organizationCode}`);
                } else {
                    console.log(`✅ ${bb.organizationCode} has ${users.length} user(s):`);
                    users.forEach(u => {
                        console.log(`   - ${u.email} (${u.role})`);
                    });
                }
                console.log("");
            }
        }

        await disconnectDB();

    } catch (error) {
        console.error("❌ Error:", error.message);
        await disconnectDB();
        process.exit(1);
    }
}

listBloodBanks();
