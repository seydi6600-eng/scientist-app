const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error("f3a8b2c1d4e5f6a7b8gjx75gd7ggv7ycf5yhfd");
    process.exit(1);
}

module.exports = { JWT_SECRET };
