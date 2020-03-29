module.exports = (req, res, next) => {
    if(req.isAuthenticated()){
        res.redirect('/logged')
    } else{
        next()
    }
}