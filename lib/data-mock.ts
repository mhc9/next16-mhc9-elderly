export const dashboardData = {
    summary: [
        { label: "Target Population", value: 471695, suffix: "คน", icon: "Users" },
        { label: "Screening Coverage", value: 52.2, suffix: "%", icon: "ClipboardCheck" },
        { label: "Risk Detection Rate", value: 3.39, suffix: "%", icon: "AlertTriangle" },
        { label: "Care Delivery Rate", value: 29.75, suffix: "%", icon: "HeartPulse" },
    ],
    funnel: [
        { name: "Target", value: 471695, fill: "#0d9488" },
        { name: "Screened", value: 246202, fill: "#0f766e" },
        { name: "At Risk", value: 8354, fill: "#115e59" },
        { name: "Assisted", value: 2485, fill: "#134e4a" },
    ],
    assessments: [
        { name: "9Q (Depression)", normal: 2319, risk: 37 },
        { name: "8Q (Suicide)", normal: 1818, risk: 24 },
    ],
    careTypes: [
        { name: "Counseling", value: 1812 },
        { name: "Referral", value: 11 },
    ],
    districts: [
        { name: "Kham Thale So", target: 4571, screened: 2462, risk: 83, care: 25 },
        { name: "District A", target: 5000, screened: 3000, risk: 100, care: 80 },
        { name: "District B", target: 6200, screened: 2800, risk: 120, care: 40 },
        { name: "District C", target: 4800, screened: 4100, risk: 90, care: 85 },
    ]
};
