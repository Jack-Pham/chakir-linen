//const https = require('https');
//const qs = require('query-string');
const OrdersService = require('../services/orders/orders');
const OrderTransactionsService = require('../services/orders/orderTransactions');
const stripePackage = require("stripe");

const getPaymentFormSettings = (options) => {
  const { gateway, gatewaySettings, order, amount, currency } = options;

  const formSettings = {
    order_id: order.id,
    amount: amount,
    currency: currency,
    email: order.email,
    public_key: gatewaySettings.public_key
  };

  return Promise.resolve(formSettings);
}

const processPayment = (options) => {
  const { gateway, gatewaySettings, req, res } = options;
  const params = req.body;
  const orderId = params.order.id;

  res.status(200).end();
  const secret_key = gatewaySettings.secret_key;
  process(params, secret_key)
    .then((payment) => {
      OrdersService.updateOrder(orderId, { paid: true, date_paid: new Date() });
      return payment;
    })
    .then((payment) => {
      return OrderTransactionsService.addTransaction(orderId, {
        transaction_id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        details: `${payment.source.name}, ${params.email}`,
        success: true
      });
    })
    .catch((e) => {
      console.error(e);
    })
}

const process = (params, secret_key) => {

  return new Promise((resolve, reject) => {
    if (!params || Object.keys(params).length === 0) {
      return reject('Params is empty');
    }
    const amount = Number((params.amount * 100).toFixed(0))
    const stripe = stripePackage(secret_key);
    const charge = stripe.charges.create({
      amount: amount,
      currency: params.currency,
      description: params.statement,
      statement_descriptor: params.statement,
      metadata: {
        order_id: params.order.id
      },
      source: params.stripeToken.id
    }).then(function(response) {
      return resolve(response);
    }, function(err) {
      return reject('Stripe Payment Processing error: ' + err);
    });
  });
};


module.exports = {
  getPaymentFormSettings: getPaymentFormSettings,
  processPayment: processPayment
}
