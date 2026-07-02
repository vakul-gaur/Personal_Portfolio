const Visitor = require("../models/Visitor");
const ViewCounter = require("../models/ViewCounter");
const crypto = require("crypto");

async function bumpViewCounter(page) {
    await ViewCounter.findOneAndUpdate( { page }, { $inc: { count: 1 } }, { upsert: true, new: true } );
}

async function trackVisitor(req, res, page) {
    try {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState !== 1) return;
        let visitorId = req.cookies.visitorId;

        if (!visitorId) {
            visitorId = crypto.randomUUID();
            res.cookie("visitorId", visitorId, {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
                sameSite: "lax"
            });
        }

        const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || "Unknown";
        let city = "Unknown";
        let country = "Unknown";
        let region = "Unknown";

        try {
            const geo = await fetch( `http://ip-api.com/json/${ip}?fields=city,country,regionName` );
            const data = await geo.json();
            city = data.city || "Unknown";
            country = data.country || "Unknown";
            region = data.regionName || "Unknown";
        } catch {}

        const ua = req.headers["user-agent"] || "";

        const device = /mobile/i.test(ua) ? "Mobile" : /tablet|ipad/i.test(ua) ? "Tablet": "Desktop";

        const browser = /chrome/i.test(ua) && !/edg/i.test(ua) ? "Chrome"
        : /firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) && !/chrome/i.test(ua) ? "Safari"
        : /edg/i.test(ua) ? "Edge" : /opr|opera/i.test(ua) ? "Opera" : "Other";

        let visitor = await Visitor.findOne({ visitorId });
        if (!visitor) { 
            visitor = await Visitor.create({ visitorId, ip, city, region, country, device, browser,
            firstVisit: new Date(), lastVisit: new Date(),
            pages: [{ page, visitedAt: new Date() }]
            });

            if (page === "portfolio") {
                await bumpViewCounter("portfolio");
            }
            return;
        }


        visitor.lastVisit = new Date();
        const alreadyVisited = visitor.pages.some( p => p.page === page );

        if (!alreadyVisited) {
            visitor.pages.push({ page, visitedAt: new Date() });
            if (page === "portfolio") {
                await bumpViewCounter("portfolio");
            }
        }

        await visitor.save();

    }

    catch (err) {
        console.error("Visitor Tracking Error:", err);
    }
}

module.exports = { trackVisitor };