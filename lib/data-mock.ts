export const dashboardData = {
    summary: [
        { label: "ประชากรเป้าหมาย", value: 471695, suffix: "คน", icon: "Users" },
        { label: "ความครอบคลุมการคัดกรอง", value: 52.2, suffix: "%", icon: "ClipboardCheck" },
        { label: "อัตราการพบความเสี่ยง", value: 3.39, suffix: "%", icon: "AlertTriangle" },
        { label: "อัตราการได้รับการดูแล", value: 29.75, suffix: "%", icon: "HeartPulse" },
    ],
    funnel: [
        { name: "เป้าหมาย", value: 471695, fill: "#0d9488" },
        { name: "คัดกรองแล้ว", value: 246202, fill: "#0f766e" },
        { name: "พบความเสี่ยง", value: 8354, fill: "#115e59" },
        { name: "ได้รับดูแล", value: 2485, fill: "#134e4a" },
    ],
    assessments: [
        { name: "9Q (ภาวะซึมเศร้า)", normal: 2319, risk: 37 },
        { name: "8Q (ความเสี่ยงฆ่าตัวตาย)", normal: 1818, risk: 24 },
    ],
    careTypes: [
        { name: "การให้คำปรึกษา", value: 1812 },
        { name: "การส่งต่อ", value: 11 },
    ],
    districts: [
        { name: "ขามทะเลสอ", target: 4571, screened: 2462, risk: 83, care: 25 },
        { name: "อำเภอ เอ", target: 5000, screened: 3000, risk: 100, care: 80 },
        { name: "อำเภอ บี", target: 6200, screened: 2800, risk: 120, care: 40 },
        { name: "อำเภอ ซี", target: 4800, screened: 4100, risk: 90, care: 85 },
    ]
};
