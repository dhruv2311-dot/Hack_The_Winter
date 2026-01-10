import { connectDB, disconnectDB, getDB } from "./config/db.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

async function setupBloodBank() {
    try {
        await connectDB();
        const db = getDB();

        console.log("\n=== BLOOD BANK SETUP ===\n");

        const organizationCode = "BB-MUM-001";

        // 1. Check if organization exists
        let organization = await db.collection("organizations").findOne({
            organizationCode: organizationCode
        });

        if (!organization) {
            console.log("📦 Creating Blood Bank Organization...");

            // Create organization
            organization = {
                _id: new ObjectId(),
                organizationCode: "BB-MUM-001",
                name: "City Blood Bank Mumbai",
                type: "bloodbank",
                email: "contact@citybloodbank.com",
                phone: "9876543210",
                licenseNumber: "BB-MH-2024-001",
                status: "APPROVED",
                verificationStatus: "APPROVED",
                location: {
                    type: "Point",
                    coordinates: [72.8777, 19.0760], // Mumbai coordinates
                    address: "Dadar West, Mumbai",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400028"
                },
                bloodStock: {
                    "A+": { units: 10, lastUpdated: new Date() },
                    "A-": { units: 5, lastUpdated: new Date() },
                    "B+": { units: 8, lastUpdated: new Date() },
                    "B-": { units: 3, lastUpdated: new Date() },
                    "AB+": { units: 4, lastUpdated: new Date() },
                    "AB-": { units: 2, lastUpdated: new Date() },
                    "O+": { units: 15, lastUpdated: new Date() },
                    "O-": { units: 6, lastUpdated: new Date() }
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection("organizations").insertOne(organization);
            console.log("✅ Organization Created:", organization._id);
        } else {
            console.log("✅ Organization Already Exists:", organization._id);
        }

        console.log(`   Name: ${organization.name}`);
        console.log(`   Type: ${organization.type}`);
        console.log(`   Status: ${organization.status}\n`);

        // 2. Check if user exists
        let user = await db.collection("organizationUsers").findOne({
            organizationCode: organizationCode,
            email: "contact@citybloodbank.com"
        });

        if (!user) {
            console.log("👤 Creating Blood Bank User...");

            const hashedPassword = await bcrypt.hash("bloodbank123", 10);

            user = {
                _id: new ObjectId(),
                organizationCode: organizationCode,
                organizationName: organization.name,
                organizationType: organization.type,
                userCode: `${organizationCode}-ADMIN`,
                name: "Blood Bank Admin",
                email: "contact@citybloodbank.com",
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection("organizationUsers").insertOne(user);
            console.log("✅ User Created:", user.userCode);
        } else {
            console.log("✅ User Already Exists:", user.userCode);

            // Update password
            const hashedPassword = await bcrypt.hash("bloodbank123", 10);
            await db.collection("organizationUsers").updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword, updatedAt: new Date() } }
            );
            console.log("✅ Password Updated");
        }

        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}\n`);

        console.log("📝 LOGIN CREDENTIALS:");
        console.log(`   Organization Code: ${organizationCode}`);
        console.log(`   Email: contact@citybloodbank.com`);
        console.log(`   Password: bloodbank123\n`);

        console.log("✅ Setup Complete!\n");

        await disconnectDB();

    } catch (error) {
        console.error("❌ Error:", error.message);
        await disconnectDB();
        process.exit(1);
    }
}

setupBloodBank();
