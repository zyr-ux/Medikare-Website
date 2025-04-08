// Initialize Firebase (replace with your config)
const firebaseConfig = {
    apiKey: "AIzaSyBZy4yFDb2nGj8PCeRVeL0H0juJAiA_4ys",
    authDomain: "medikare-kiit.firebaseapp.com",
    projectId: "medikare-kiit",
    storageBucket: "medikare-kiit.firebasestorage.app",
    messagingSenderId: "522506024953",
    appId: "1:522506024953:web:b47dc761f6c13f7f5baf28",
    measurementId: "G-YMNE83R1DC"
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in:", user.email);
      // Enable PDF submission features here
    } else {
      alert("You must be logged in to use this page.");
      window.location.href = "../html/login.html"; // or your login page
    }
  });
  
  // Function to generate a custom prescription ID
  function generatePrescriptionID(patientName) {
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
    const initials = patientName.split(' ').map(n => n[0]).join('').toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RX-${datePart}-${initials}-${randomPart}`;
  }
  
  // Make sure jsPDF and autoTable are loaded
  const { jsPDF } = window.jspdf;
  if (typeof jsPDF.API.autoTable !== 'function') {
      console.error("Error: jsPDF autoTable plugin is not loaded correctly!");
  }
  
  // --- Function to calculate BMI ---
  function calculateBMI() {
      const weight = parseFloat(document.getElementById('patientWeight').value);
      const height = parseFloat(document.getElementById('patientHeight').value);
      
      if (weight && height) {
          // Convert height from cm to meters
          const heightInMeters = height / 100;
          const bmi = weight / (heightInMeters * heightInMeters);
          document.getElementById('patientBMI').value = bmi.toFixed(1);
      } else {
          alert("Please enter both weight and height to calculate BMI");
      }
  }
  
  // --- Function to fetch the Base64 string from a file ---
  async function getBase64FromFile(filePath) {
      if (!filePath || filePath.endsWith('no_logo.txt')) {
          console.log("No logo file specified or selected.");
          return null;
      }
      try {
          const response = await fetch(filePath);
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status} while fetching ${filePath}`);
          }
          const base64String = await response.text();
          if (!base64String || base64String.trim().length === 0) {
              console.warn(`Logo file '${filePath}' is empty.`);
              return null;
          }
          return base64String.trim();
      } catch (error) {
          console.error(`Error loading Base64 logo from ${filePath}:`, error);
          alert(`Failed to load hospital logo file '${filePath}'. PDF will be generated without a logo.`);
          return null;
      }
  }
  
  // --- Function to add medication rows dynamically ---
  function addMedicationRow() {
      const tableBody = document.getElementById('medications-body');
      if (!tableBody) {
          console.error("Medications table body not found!");
          return;
      }
      const newRow = tableBody.insertRow();
      newRow.innerHTML = `
          <td><input type="text" class="med-medicine" placeholder="Medicine Name"></td>
          <td><input type="text" class="med-dosage" placeholder="e.g., 500mg OD"></td>
          <td><input type="text" class="med-details1" placeholder="e.g., After Food"></td>
          <td><input type="text" class="med-details2" placeholder="e.g., 7 days"></td>
          <td><span class="remove-row-btn" style="cursor:pointer; color:red; font-weight:bold;">X</span></td>
      `;
  }
  
  // --- Function to gather form data ---
  function getFormData() {
      const hospitalSelect = document.getElementById('hospitalSelect');
      const selectedHospitalOption = hospitalSelect ? hospitalSelect.options[hospitalSelect.selectedIndex] : null;
  
      const formData = {
          doctorName: "Dr. " + (document.getElementById('doctorName')?.value || ''),
          doctorCredentials: document.getElementById('doctorCredentials')?.value || '',
          doctorPhone: document.getElementById('doctorPhone')?.value || '',
          hospitalName: selectedHospitalOption ? selectedHospitalOption.text : 'N/A',
          hospitalLogoFile: hospitalSelect ? hospitalSelect.value : '',
          consultationDate: document.getElementById('consultationDate')?.value || '',
          consultationType: document.getElementById('consultationType')?.value || '',
          patientName: document.getElementById('patientName')?.value || '',
          patientSex: document.getElementById('patientSex')?.value || '',
          patientAge: document.getElementById('patientAge')?.value || '',
          patientWeight: document.getElementById('patientWeight')?.value || '',
          patientHeight: document.getElementById('patientHeight')?.value || '',
          patientBMI: document.getElementById('patientBMI')?.value || '',
          patientBP: document.getElementById('patientBP')?.value || '',
          diagnosis: document.getElementById('diagnosis')?.value || '',
          medications: []
      };
  
      const medicationRows = document.querySelectorAll('#medications-body tr');
      medicationRows.forEach(row => {
          const medicineInput = row.querySelector('.med-medicine');
          const dosageInput = row.querySelector('.med-dosage');
          const details1Input = row.querySelector('.med-details1');
          const details2Input = row.querySelector('.med-details2');
          if (medicineInput && medicineInput.value.trim() !== '') {
               formData.medications.push({
                   medicine: medicineInput.value.trim(),
                   dosage: dosageInput ? dosageInput.value.trim() : '',
                   details1: details1Input ? details1Input.value.trim() : '',
                   details2: details2Input ? details2Input.value.trim() : ''
               });
          }
      });
      return formData;
  }
  
  // --- The main PDF Generation Function ---
  async function generateAndDownloadPDF(formData, logoDataUrl) {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let currentY = 20;
      const lineSpacing = 7;
      const sectionSpacing = 8;
  
      // Helper to add text and update Y position
      const addText = (text, x, y, options = {}) => {
          doc.setFontSize(options.fontSize || 10);
          doc.setFont(undefined, options.fontStyle || 'normal');
          doc.text(String(text || ''), x, y, options);
          return y + (options.lineSpacing || lineSpacing);
      };
  
      // --- Logo Handling ---
      const logoWidth = 45;
      const logoX = pageWidth - margin - logoWidth;
      const logoY = 15;
      let logoHeight = 0;
  
      if (logoDataUrl) {
          try {
              const imageTypeMatch = logoDataUrl.match(/^data:image\/(\w+);/);
              const imageType = imageTypeMatch ? imageTypeMatch[1].toUpperCase() : 'PNG';
              
              const img = new Image();
              img.src = logoDataUrl;
              
              await new Promise((resolve) => {
                  img.onload = resolve;
              });
              
              logoHeight = logoWidth / (img.width / img.height);
              const maxLogoHeight = 30;
              if (logoHeight > maxLogoHeight) {
                  logoHeight = maxLogoHeight;
              }
              
              doc.addImage({
                  imageData: logoDataUrl,
                  x: logoX,
                  y: logoY,
                  width: logoWidth,
                  height: logoHeight
              });
          } catch (e) {
              console.error("Error adding image to PDF: ", e);
          }
      }
  
      // --- Prescription ID ---
      currentY = addText(`Prescription ID: ${formData.prescriptionID}`, margin, currentY, {
          fontSize: 10,
          fontStyle: 'bold'
      });
      currentY += lineSpacing;
  
      // --- Header Section ---
      const headerStartY = Math.max(currentY, logoY);
      const textBlockWidth = pageWidth - margin * 2 - logoWidth - 10;
      
      let textBlockEndY = addText(formData.doctorName, margin, headerStartY, { 
          fontSize: 12, 
          fontStyle: 'bold',
          maxWidth: textBlockWidth
      });
      
      textBlockEndY = addText(formData.doctorCredentials, margin, textBlockEndY, {
          maxWidth: textBlockWidth
      });
      
      textBlockEndY = addText(`Phone: ${formData.doctorPhone}`, margin, textBlockEndY, {
          maxWidth: textBlockWidth
      });
  
      // --- Consultation Details ---
      currentY = textBlockEndY + 3;
      currentY = addText(`Date: ${formData.consultationDate || 'N/A'}`, margin, currentY);
      currentY = addText(`Consultation Type: ${formData.consultationType || 'N/A'}`, margin, currentY);
      currentY += sectionSpacing;
  
      // --- Patient Section ---
      currentY = addText('Patient', margin, currentY, { fontSize: 12, fontStyle: 'bold', lineSpacing: 5 });
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineSpacing;
      currentY = addText(`Name: ${formData.patientName || 'N/A'}`, margin, currentY);
      currentY = addText(`Sex: ${formData.patientSex || 'N/A'}`, margin, currentY);
      currentY = addText(`Age: ${formData.patientAge || 'N/A'}`, margin, currentY);
      currentY += sectionSpacing;
  
      // --- Vitals Section ---
      currentY = addText('Vitals', margin, currentY, { fontSize: 12, fontStyle: 'bold', lineSpacing: 5 });
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineSpacing;
      currentY = addText(`Weight: ${formData.patientWeight ? formData.patientWeight + ' kg' : 'N/A'}`, margin, currentY);
      currentY = addText(`Height: ${formData.patientHeight ? formData.patientHeight + ' cm' : 'N/A'}`, margin, currentY);
      currentY = addText(`BMI: ${formData.patientBMI || 'N/A'}`, margin, currentY);
      currentY = addText(`Blood Pressure: ${formData.patientBP || 'N/A'}`, margin, currentY);
      currentY += sectionSpacing;
  
      // --- Diagnosis Section ---
      currentY = addText('Diagnosis / Provisional Diagnosis', margin, currentY, { fontSize: 12, fontStyle: 'bold', lineSpacing: 5 });
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineSpacing;
      const diagnosisLines = doc.splitTextToSize(formData.diagnosis || 'N/A', pageWidth - margin * 2);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(diagnosisLines, margin, currentY);
      currentY += diagnosisLines.length * (lineSpacing * 0.7);
      currentY += sectionSpacing;
  
      // --- Medication Prescribed Section ---
      currentY = addText('Medication Prescribed', margin, currentY, { fontSize: 12, fontStyle: 'bold' });
      currentY += 2;
  
      if (formData.medications && formData.medications.length > 0) {
          const tableHeaders = [['Medicine', 'Dosage', 'Details', 'Details']];
          const tableBody = formData.medications.map(med => [med.medicine, med.dosage, med.details1, med.details2]);
  
          doc.autoTable({
              head: tableHeaders,
              body: tableBody,
              startY: currentY,
              theme: 'grid',
              headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
              styles: { fontSize: 10, cellPadding: 2 },
              columnStyles: {
                  0: { cellWidth: 'auto' },
                  1: { cellWidth: 40 },
                  2: { cellWidth: 40 },
                  3: { cellWidth: 'auto'}
              },
              margin: { left: margin, right: margin }
          });
          currentY = doc.autoTable.previous.finalY + sectionSpacing;
      } else {
          currentY = addText('No medication prescribed.', margin, currentY, {fontStyle: 'italic'});
          currentY += sectionSpacing;
      }
  
      // --- Footer or Signature Line ---
      const signatureY = pageHeight - 30;
      if (currentY < signatureY - 10) {
          doc.line(pageWidth - margin - 60, signatureY, pageWidth - margin, signatureY);
          addText('Doctor\'s Signature', pageWidth - margin - 60, signatureY + 5);
      }
  
      // --- Save the PDF ---
      const formattedDate = formData.consultationDate 
    ? formData.consultationDate.replace(/-/g, '') 
    : new Date().toISOString().slice(0,10).replace(/-/g, '');

const patientNameSanitized = formData.patientName 
    ? formData.patientName.trim().replace(/\s+/g, '_') 
    : 'Patient';

const filename = `${patientNameSanitized}-prescription-${formattedDate}.pdf`;
      doc.save(filename);
  }
  
  // --- Event Listeners ---
  document.addEventListener('DOMContentLoaded', () => {
      // Add one initial medication row on page load
      addMedicationRow();
  
      // Attach listener to the "Add Medication" button
      const addMedBtn = document.getElementById('add-medication-btn');
      if(addMedBtn) {
          addMedBtn.addEventListener('click', addMedicationRow);
      }
  
      // Handle row removal via event delegation
      document.getElementById('medications-body').addEventListener('click', function(e) {
          if (e.target.classList.contains('remove-row-btn')) {
              const row = e.target.closest('tr');
              if (row) {
                  row.remove();
              }
          }
      });
  
      // BMI Calculator Button
      document.getElementById('calculateBMI').addEventListener('click', calculateBMI);
  
      // Attach listener to the form submission
      const form = document.getElementById('prescriptionForm');
      if (form) {
          form.addEventListener('submit', async (event) => {
              event.preventDefault();
  
              if (typeof jsPDF === 'undefined' || typeof jsPDF.API.autoTable !== 'function') {
                  alert("Error: PDF Library not ready. Please refresh.");
                  return;
              }
  
              // Get form data
              const formData = getFormData();
  
              // Validate selection
              if (!formData.hospitalLogoFile) {
                  alert("Please select a hospital from the dropdown menu.");
                  document.getElementById('hospitalSelect')?.focus();
                  return;
              }
  
              // Generate custom prescription ID
              const prescriptionID = generatePrescriptionID(formData.patientName);
              formData.prescriptionID = prescriptionID;
  
              // Get the logo data
              const logoDataUrl = await getBase64FromFile(formData.hospitalLogoFile);
  
              try {
                  // Save to Firestore with custom ID
                  await db.collection('prescriptions').doc(prescriptionID).set({
                      prescriptionID: prescriptionID,
                      doctorInfo: {
                          name: formData.doctorName,
                          credentials: formData.doctorCredentials,
                          phone: formData.doctorPhone
                      },
                      consultationDetails: {
                          date: formData.consultationDate,
                          type: formData.consultationType
                      },
                      patientInfo: {
                          name: formData.patientName,
                          sex: formData.patientSex,
                          age: formData.patientAge,
                          weight: formData.patientWeight,
                          height: formData.patientHeight,
                          bmi: formData.patientBMI,
                          bloodPressure: formData.patientBP
                      },
                      diagnosis: formData.diagnosis,
                      medications: formData.medications,
                      createdAt: firebase.firestore.FieldValue.serverTimestamp()
                  });
  
                  console.log("Prescription saved with ID: ", prescriptionID);
                  
                  // Generate PDF after successful save
                  await generateAndDownloadPDF(formData, logoDataUrl);
                  
                  // Show ID to user
                  alert(`Prescription created successfully! ID: ${prescriptionID}`);
                  
              } catch (error) {
                  console.error("Error saving prescription: ", error);
                  alert(`Error saving prescription: ${error.message}`);
              }
          });
      }
  });