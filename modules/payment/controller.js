const { createSeller, checkSellerId, updateOnBoardStatus } = require("./service");

const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createSellerController(req, res) {

    const { email } = req.body;

    try {
        // Create an Express account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',            // or your sellers’ country
          business_type: 'individual', // or 'company'
        });
    
        const accountRes = account.json();

        const serviceRes = await createSeller(email, accountRes.id);
    
        res.status(200).json({
          success: true,
          message: "Seller created successfully",
          data: serviceRes
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({success: false, error: err.message });
    }
}

async function onboardSellerController(req, res){

    const { email } = req.body;

    // Check if the user has already started onboarding

    try {

      //
      const doesSellerExist = await checkSellerId(email);
      if (doesSellerExist===null) {
        try {
          // Create an Express account
          const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',            // or your sellers’ country
            business_type: 'individual', // or 'company'
          });
  
          createSeller(email, account.id);

          const linkRes = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: "http://localhost:3000/upload/text",   
            return_url: "http://localhost:3000/api/payment/updateOnBoard",     
            type: 'account_onboarding',
          });
      
          return res.status(200).json({ success: true, data: {url : linkRes.url}});
        } catch (err) {
          console.error(err);
          res.status(500).json({success: false, error: err.message });
        }
      }
    
      try {
          const linkRes = await stripe.accountLinks.create({
          account: await checkSellerId(email),
          refresh_url: "http://localhost:3000/upload/text",   
          return_url: "http://localhost:3000/api/payment/updateOnBoard",     
          type: 'account_onboarding',
          });

          res.json({ url: linkRes.url, success: true });
      } catch (err) {
          console.error(err);
          res.status(500).json({success: false, error: err.message });
      }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message, success: false });
    }
}

module.exports = {
  createSellerController,
  onboardSellerController
};