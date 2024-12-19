fetch('http://localhost:3000')
  .then(response => response.text())  // قراءة الاستجابة كنص
  .then(data => {
    console.log('Response from server:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });