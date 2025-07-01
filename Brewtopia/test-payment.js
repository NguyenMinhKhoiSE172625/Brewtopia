// Test file để kiểm tra PayOS payment
// Chạy: node test-payment.js

const API_BASE_URL = 'https://your-api-domain.com/api'; // Thay bằng domain thực tế

async function testPaymentCreation() {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/createPayos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Thay bằng token thực tế
      },
      body: JSON.stringify({
        targetModel: 'UpgradePremium',
        amount: 2000,
        description: 'Premium Subscription - 1 Month',
        returnUrl: 'brewtopia://payment-success',
        cancelUrl: 'brewtopia://payment-cancel'
      })
    });

    const data = await response.json();
    console.log('Payment creation response:', data);
    
    if (data.data && data.data.checkoutUrl) {
      console.log('✅ Payment created successfully!');
      console.log('Checkout URL:', data.data.checkoutUrl);
    } else {
      console.log('❌ Payment creation failed:', data);
    }
  } catch (error) {
    console.error('❌ Error creating payment:', error);
  }
}

// Chạy test
testPaymentCreation(); 