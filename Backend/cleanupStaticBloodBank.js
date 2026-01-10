import { connectDB, disconnectDB, getDB } from "./config/db.js";

async function cleanupStaticBloodBank() {
    try {
        await connectDB();
        const db = getDB();

        console.log("\n=== CLEANUP STATIC BLOOD BANK ===\n");

        // Delete the static blood bank we created
        const deleteOrgResult = await db.collection("organizations").deleteOne({
            organizationCode: "BB-MUM-001"
        });

        console.log(`Deleted ${deleteOrgResult.deletedCount} organization(s) with code BB-MUM-001`);

        // Delete the static user
        const deleteUserResult = await db.collection("organizationUsers").deleteMany({
            organizationCode: "BB-MUM-001"
        });

        console.log(`Deleted ${deleteUserResult.deletedCount} user(s) with code BB-MUM-001`);

        console.log("\n✅ Cleanup Complete!\n");
        console.log("Now your Blood Bank dashboard will only use data from your actual database.\n");

        await disconnectDB();

    } catch (error) {
        console.error("❌ Error:", error.message);
        await disconnectDB();
        process.exit(1);
    }
}

cleanupStaticBloodBank();
