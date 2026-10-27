import dns from "node:dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not set");

    const configuredDnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim());
    if (configuredDnsServers) {
        if (configuredDnsServers.some((server) => !server)) {
            throw new Error("DNS_SERVERS must be a comma-separated list of DNS server IP addresses");
        }
        dns.setServers(configuredDnsServers);
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
};

export default connectDB;