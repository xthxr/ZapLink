// Future controller methods will go here

const healthCheck = (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
};

module.exports = {
    healthCheck
};
