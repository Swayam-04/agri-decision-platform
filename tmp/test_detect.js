function checkIsPlantLeaf(greenRatio, skinRatio) {
    // Logic from page.tsx:
    // const isLeaf = greenRatio > 0.15 && skinRatio < 0.15;
    return greenRatio > 0.15 && skinRatio < 0.15;
}

const tests = [
    { name: "Full Green Leaf", green: 0.8, skin: 0.0, expected: true },
    { name: "Mostly Face", green: 0.05, skin: 0.7, expected: false },
    { name: "Face with Green Background", green: 0.2, skin: 0.6, expected: false },
    { name: "Small Leaf", green: 0.1, skin: 0.0, expected: false }, // Should be rejected now (too small)
    { name: "Large Leaf", green: 0.4, skin: 0.1, expected: true }
];

tests.forEach(t => {
    const result = checkIsPlantLeaf(t.green, t.skin);
    console.log(`Test [${t.name}]: ${result === t.expected ? "PASS" : "FAIL"} (Result: ${result}, Expected: ${t.expected})`);
});
