const validateVersion = (req, res, next) => {
  const { version } = req.query
  if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
    return res.status(400).json({ error: "Invalid version format. Expected format: x.y.z" })
  }
  next()
}

module.exports = validateVersion