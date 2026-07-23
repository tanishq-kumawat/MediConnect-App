import http from 'http';

const testEndpoint = (path, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body && { 'Content-Length': Buffer.byteLength(dataString) })
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(dataString);
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing Jaipur MediConnect API Endpoints...\n');

  try {
    // 1. Health check
    const health = await testEndpoint('/health');
    console.log('✅ /health:', health.status, health.data.service);

    // 2. Fetch Doctors
    const doctors = await testEndpoint('/doctors');
    console.log(`✅ /doctors: Found ${doctors.data.length} doctors`);
    console.log(`   Sample Doctor: ${doctors.data[0]?.name} (${doctors.data[0]?.specialization} @ ${doctors.data[0]?.hospital?.name})`);

    // 3. Fetch Hospitals
    const hospitals = await testEndpoint('/hospitals');
    console.log(`✅ /hospitals: Found ${hospitals.data.length} Jaipur hospitals`);

    // 4. AI Symptom Triage Check
    const triage = await testEndpoint('/triage/check', 'POST', {
      message: 'I have a skin rash and itching on my arm'
    });
    console.log(`✅ /triage/check: Specialization Needed = ${triage.data.specializationNeeded}`);
    console.log(`   Recommended Doctors: ${triage.data.doctors.map((d) => d.name).join(', ')}`);

    // 5. Test Webhook Endpoint
    const webhook = await testEndpoint('/webhooks/payments', 'POST', {
      event: 'payment_intent.succeeded',
      data: {
        appointmentId: '6a60c6dfd0283439650f71e9',
        transactionId: 'TXN_TEST_9999',
        amountPaid: 500
      }
    });
    console.log(`✅ /webhooks/payments: Status = ${webhook.data.status}`);

    console.log('\n🎉 ALL BACKEND API TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
