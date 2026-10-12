// Demo nalog je javan (piše na stranici za prijavu), pa sme samo da čita.
// Svaki zahtev koji menja podatke (POST, PUT, PATCH, DELETE) se odbija.
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

module.exports = (req, res, next) => {
  // Proverava se i korisničko ime, za slučaj da baza ne dozvoljava ulogu 'demo'
  const isDemo = req.user?.role === 'demo' || req.user?.username === 'demo';
  if (isDemo && !READ_METHODS.includes(req.method)) {
    return res.status(403).json({ error: 'Demo nalog može samo da pregleda podatke.' });
  }
  next();
};
