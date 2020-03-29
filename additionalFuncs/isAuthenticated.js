module.exports = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    } else{
        req.flash('error', 'You need to log in')
        res.redirect("/login");
    }
}