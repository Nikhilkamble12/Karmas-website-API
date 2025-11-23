async function getSosUserJsonFileName(userId) {
    const batchSize = 500;
    const lowerLimit = Math.floor((userId - 1) / batchSize) * batchSize + 1;
    const upperLimit = lowerLimit + batchSize - 1;
    return `user_${lowerLimit}_${upperLimit}.json`;
}
export default getSosUserJsonFileName