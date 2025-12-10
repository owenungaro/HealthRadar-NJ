import { Router } from "express";
import { hospitals as hospitalsCollection } from "../config/mongoCollections.js";
import { requireAuth } from "../middleware/authMiddleware.js";

let router = Router();

router.route("/").get(requireAuth, async (req, res) => {
  try {
    let hospitals = await hospitalsCollection();
    let all = await hospitals.find({}).toArray();

    let countyMap = {};
    for (let i = 0; i < all.length; i++) {
      let c = all[i].county;
      if (!countyMap[c]) {
        countyMap[c] = 1;
      } else {
        countyMap[c] += 1;
      }
    }

    let hospitalsByCounty = [];
    let countyKeys = Object.keys(countyMap);
    for (let i = 0; i < countyKeys.length; i++) {
      hospitalsByCounty.push({
        county: countyKeys[i],
        count: countyMap[countyKeys[i]],
      });
    }

    let active = 0;
    let inactive = 0;

    for (let i = 0; i < all.length; i++) {
      if (all[i].isActive === true) {
        active++;
      } else {
        inactive++;
      }
    }

    let activeBreakdown = [
      { status: "Active", count: active },
      { status: "Inactive", count: inactive },
    ];

    let typeMap = {};
    for (let i = 0; i < all.length; i++) {
      let t = all[i].facility_type;
      if (!typeMap[t]) {
        typeMap[t] = 1;
      } else {
        typeMap[t] += 1;
      }
    }

    let typeDistribution = [];
    let typeKeys = Object.keys(typeMap);
    for (let i = 0; i < typeKeys.length; i++) {
      typeDistribution.push({
        type: typeKeys[i],
        count: typeMap[typeKeys[i]],
      });
    }

    let licenseMap = {};
    for (let i = 0; i < all.length; i++) {
      if (!all[i].licenseExpires) continue;
      let month = String(all[i].licenseExpires).substring(0, 7);

      if (!licenseMap[month]) {
        licenseMap[month] = 1;
      } else {
        licenseMap[month] += 1;
      }
    }

    let licenseTimeline = [];
    let licenseKeys = Object.keys(licenseMap);
    for (let i = 0; i < licenseKeys.length; i++) {
      licenseTimeline.push({
        month: licenseKeys[i],
        count: licenseMap[licenseKeys[i]],
      });
    }

    // console.log("TOTAL RECORDS:", all.length);
    // console.log("COUNTY MAP:", countyMap);
    // console.log("COUNTY GRAPH DATA:", hospitalsByCounty);
    // console.log("ACTIVE:", activeBreakdown);
    // console.log("TYPES:", typeDistribution);
    // console.log("LICENSE:", licenseTimeline);

    return res.render("analytics", {
      title: "Analytics Dashboard",
      hospitalsByCounty: hospitalsByCounty,
      activeBreakdown: activeBreakdown,
      typeDistribution: typeDistribution,
      licenseTimeline: licenseTimeline,
      user: req.session.user,

      countyLabels: JSON.stringify(hospitalsByCounty.map((x) => x.county)),
      countyCounts: JSON.stringify(hospitalsByCounty.map((x) => x.count)),

      statusLabels: JSON.stringify(activeBreakdown.map((x) => x.status)),
      statusCounts: JSON.stringify(activeBreakdown.map((x) => x.count)),

      typeLabels: JSON.stringify(typeDistribution.map((x) => x.type)),
      typeCounts: JSON.stringify(typeDistribution.map((x) => x.count)),

      licenseLabels: JSON.stringify(licenseTimeline.map((x) => x.month)),
      licenseCounts: JSON.stringify(licenseTimeline.map((x) => x.count)),
    });
  } catch (e) {
    console.log(e);
    return res.status(500).render("error", {
      title: "Error",
      error: "Failed to load analytics dashboard",
    });
  }
});

export default router;
