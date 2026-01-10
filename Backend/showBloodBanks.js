import { connectDB, disconnectDB, getDB } from "./config/db.js";

async function showBloodBanks() {
    try {
        await connectDB();
        const db = getDB();

        console.log("\n=== YOUR BLOOD BANKS ===\n");

        const bloodBanks = await db.collection("organizations").find({
            type: "bloodbank"
        }).toArray();

        if (bloodBanks.length === 0) {
            console.log("❌ No blood banks found!");
            console.log("\nYou need to add blood bank organizations to your database.");
            console.log("They should be in the 'organizations' collection with type: 'bloodbank'");
        } else {
            console.log(`Found ${bloodBanks.length} blood bank(s):\n`);

            bloodBanks.forEach((bb, i) => {
                console.log(`${i + 1}. ${bb.name || 'Unnamed'}`);
                console.log(`   Code: ${bb.organizationCode || 'N/A'}`);
                console.log(`   Email: ${bb.email || 'N/A'}`);
                console.log(`   City: ${bb.location?.city || bb.city || 'N/A'}`);
                console.log(`   ID: ${bb._id}\n`);
            });
        }

        await disconnectDB();

    } catch (error) {
        console.error("Error:", error.message);
        await disconnectDB();
    }
}

showBloodBanks();
