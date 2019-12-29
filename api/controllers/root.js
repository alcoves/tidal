exports.rootQuery = async (req, res) => {
  res.status(200).send({
    message: 'server is online',
  });
}