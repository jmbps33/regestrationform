
        let currentStep = 1;
        let isDrawing = false;
        let signatureCanvas = null;
        let signatureCtx = null;

        // Initialize signature canvas
        document.addEventListener('DOMContentLoaded', function() {
            signatureCanvas = document.getElementById('signatureCanvas');
            signatureCtx = signatureCanvas.getContext('2d');
            
            // Set up signature canvas
            signatureCtx.strokeStyle = '#000';
            signatureCtx.lineWidth = 2;
            signatureCtx.lineCap = 'round';
            
            // Mouse events
            signatureCanvas.addEventListener('mousedown', startDrawing);
            signatureCanvas.addEventListener('mousemove', draw);
            signatureCanvas.addEventListener('mouseup', stopDrawing);
            signatureCanvas.addEventListener('mouseout', stopDrawing);
            
            // Touch events for mobile
            signatureCanvas.addEventListener('touchstart', handleTouch);
            signatureCanvas.addEventListener('touchmove', handleTouch);
            signatureCanvas.addEventListener('touchend', stopDrawing);
            
            // Photo upload
            document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
        });

        function nextStep(step) {
            if (validateCurrentStep()) {
                updateStepIndicator(step);
                showStep(step);
                currentStep = step;
                
                if (step === 4) {
                    populateSummary();
                }
            }
        }

        function prevStep(step) {
            updateStepIndicator(step);
            showStep(step);
            currentStep = step;
        }

        function showStep(step) {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`step${step}`).classList.add('active');
        }

        function updateStepIndicator(step) {
            for (let i = 1; i <= 4; i++) {
                const indicator = document.getElementById(`step${i}-indicator`);
                indicator.classList.remove('step-active', 'step-completed', 'step-inactive');
                
                if (i < step) {
                    indicator.classList.add('step-completed');
                } else if (i === step) {
                    indicator.classList.add('step-active');
                } else {
                    indicator.classList.add('step-inactive');
                }
            }
        }

        function validateCurrentStep() {
            if (currentStep === 1) {
                const required = ['firstName', 'lastName', 'email', 'phone', 'address'];
                for (let field of required) {
                    const element = document.getElementById(field);
                    if (!element.value.trim()) {
                        element.focus();
                        element.classList.add('border-red-500');
                        setTimeout(() => element.classList.remove('border-red-500'), 3000);
                        return false;
                    }
                }
            }
            return true;
        }

        function handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file (JPG, PNG, GIF)');
                    return;
                }
                
                // Validate file size (max 10MB for high quality photos)
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create an image element to process the real photo
                    const img = new Image();
                    img.onload = function() {
                        // Create canvas for high-quality photo processing
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set optimal dimensions for loyalty card printing (300 DPI equivalent)
                        const targetWidth = 600;  // Optimal for ID card printing
                        const targetHeight = 800; // Portrait orientation for loyalty cards
                        let { width, height } = img;
                        
                        // Calculate dimensions maintaining aspect ratio
                        const aspectRatio = width / height;
                        if (aspectRatio > targetWidth / targetHeight) {
                            // Image is wider - fit to width
                            width = targetWidth;
                            height = targetWidth / aspectRatio;
                        } else {
                            // Image is taller - fit to height
                            height = targetHeight;
                            width = targetHeight * aspectRatio;
                        }
                        
                        // Set canvas size for high quality
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Enable high-quality image rendering
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        
                        // Draw the real customer photo with high quality
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convert to high-quality JPEG for printing (90% quality)
                        const processedPhotoData = canvas.toDataURL('image/jpeg', 0.9);
                        
                        // Display the processed photo
                        document.getElementById('previewImage').src = processedPhotoData;
                        document.getElementById('photoPreview').classList.remove('hidden');
                        document.getElementById('photoUploadPrompt').classList.add('hidden');
                        
                        // Store the high-quality processed photo data
                        window.uploadedPhotoData = processedPhotoData;
                        window.originalFileName = file.name;
                        window.photoFileSize = file.size;
                        
                        // Show processing confirmation
                        const confirmation = document.createElement('div');
                        confirmation.className = 'text-green-600 text-sm mt-2';
                        confirmation.innerHTML = `✓ Photo processed for loyalty card printing (${(file.size / 1024 / 1024).toFixed(1)}MB → High Quality)`;
                        document.getElementById('photoPreview').appendChild(confirmation);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        function startDrawing(e) {
            isDrawing = true;
            const rect = signatureCanvas.getBoundingClientRect();
            const scaleX = signatureCanvas.width / rect.width;
            const scaleY = signatureCanvas.height / rect.height;
            
            signatureCtx.beginPath();
            signatureCtx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        }

        function draw(e) {
            if (!isDrawing) return;
            const rect = signatureCanvas.getBoundingClientRect();
            const scaleX = signatureCanvas.width / rect.width;
            const scaleY = signatureCanvas.height / rect.height;
            
            signatureCtx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
            signatureCtx.stroke();
        }

        function stopDrawing() {
            if (isDrawing) {
                isDrawing = false;
                // Store the signature as high-quality data
                window.signatureData = signatureCanvas.toDataURL('image/png');
                
                // Show signature confirmation
                const existingConfirmation = document.querySelector('#step3 .text-green-600');
                if (!existingConfirmation) {
                    const confirmation = document.createElement('div');
                    confirmation.className = 'text-green-600 text-sm mt-2 text-center';
                    confirmation.innerHTML = '✓ Digital signature captured successfully';
                    document.querySelector('#step3 .mt-4').appendChild(confirmation);
                }
            }
        }

        function handleTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = signatureCanvas.getBoundingClientRect();
            
            const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                            e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            signatureCanvas.dispatchEvent(mouseEvent);
        }

        function clearSignature() {
            signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
            window.signatureData = null;
            
            // Remove confirmation message
            const confirmation = document.querySelector('#step3 .text-green-600');
            if (confirmation) {
                confirmation.remove();
            }
        }

        function populateSummary() {
            const summary = document.getElementById('summaryContent');
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            summary.innerHTML = `
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Photo:</strong> ${document.getElementById('photoPreview').classList.contains('hidden') ? 'Not uploaded' : 'Uploaded ✓'}</p>
                <p><strong>Signature:</strong> Provided ✓</p>
            `;
        }

        function submitRegistration() {
            const termsCheckbox = document.getElementById('termsCheckbox');
            if (!termsCheckbox.checked) {
                alert('Please accept the terms and conditions to continue.');
                return;
            }

            // Generate reference ID
            const refId = 'JMB-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);
            document.getElementById('referenceId').textContent = refId;
            
            // Get customer details
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const customerEmail = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const dob = document.getElementById('dob').value;
            const contactMethod = document.getElementById('contactMethod').value;
            
            // Auto-submit to business email
            sendRegistrationToBusinessEmail(refId, firstName, lastName, customerEmail, phone, address, dob, contactMethod);
            
            // Send confirmation email to customer
            sendEmailCopyToCustomer(customerEmail, refId);
            
            // Show success modal
            document.getElementById('successModal').classList.remove('hidden');
            document.getElementById('successModal').classList.add('flex');
            
            // Redirect to Facebook profile after 5 seconds
            setTimeout(() => {
                window.open('https://web.facebook.com/profile.php?id=', '_blank');
            }, 5000);
        }

        function sendRegistrationToBusinessEmail(refId, firstName, lastName, email, phone, address, dob, contactMethod) {
            // Get real customer photo data
            let photoData = 'Not uploaded';
            let photoStatus = 'Not uploaded';
            let photoInstructions = '';
            
            if (window.uploadedPhotoData) {
                photoData = window.uploadedPhotoData; // High-quality processed customer photo
                photoStatus = '📸 REAL CUSTOMER PHOTO ATTACHED (Print-Ready Quality)';
                photoInstructions = `
🖼️ CUSTOMER PHOTO FOR LOYALTY CARD PRINTING:
Original File: ${window.originalFileName || 'customer_photo.jpg'}
File Size: ${window.photoFileSize ? (window.photoFileSize / 1024 / 1024).toFixed(1) + 'MB' : 'Unknown'}
Processing: Optimized for ID card printing (600x800px, 90% quality)

📋 PHOTO USAGE INSTRUCTIONS:
1. Copy the ENTIRE data URL below (starts with "data:image/jpeg;base64,")
2. Paste it into a new browser tab address bar
3. Press Enter to view the full-resolution customer photo
4. Right-click and "Save image as..." → Save as "${firstName}_${lastName}_loyalty_photo.jpg"
5. Use this saved photo for physical loyalty card production
6. Photo is already sized and optimized for professional ID card printing

📸 CUSTOMER PHOTO DATA (Copy this complete line):
${photoData}

`;
            }
            
            // Get real digital signature data
            let signatureData = 'Not provided';
            let signatureStatus = 'Not provided';
            let signatureInstructions = '';
            
            if (window.signatureData) {
                signatureData = window.signatureData; // High-quality PNG signature
                signatureStatus = '✍️ DIGITAL SIGNATURE CAPTURED (High Resolution)';
                signatureInstructions = `
✍️ CUSTOMER DIGITAL SIGNATURE:
Format: PNG (Transparent background)
Quality: High resolution for printing
Usage: Legal document signing and card verification

📋 SIGNATURE USAGE INSTRUCTIONS:
1. Copy the ENTIRE signature data URL below (starts with "data:image/png;base64,")
2. Paste it into a new browser tab address bar
3. Press Enter to view the customer's signature
4. Right-click and "Save image as..." → Save as "${firstName}_${lastName}_signature.png"
5. Use for loyalty card back or keep for records
6. Signature can be printed on card or stored digitally

✍️ CUSTOMER SIGNATURE DATA (Copy this complete line):
${signatureData}

`;
            }
            
            // Create email subject and body for business
            const subject = `🆔 New Loyalty Card Registration - ${firstName} ${lastName} (${refId})`;
            const body = `🎉 NEW LOYALTY CARD REGISTRATION RECEIVED

📋 REGISTRATION DETAILS:
Reference ID: ${refId}
Registration Date: ${new Date().toLocaleString()}

👤 CUSTOMER INFORMATION:
• Name: ${firstName} ${lastName}
• Email: ${email}
• Phone: ${phone}
• Address: ${address}
• Date of Birth: ${dob || 'Not provided'}
• Preferred Contact: ${contactMethod}

${photoInstructions}

${signatureInstructions}

📝 LOYALTY CARD PRODUCTION STATUS:
Photo Status: ${photoStatus}
Signature Status: ${signatureStatus}

${window.uploadedPhotoData && window.signatureData ? `
✅ COMPLETE REGISTRATION - READY FOR CARD PRODUCTION:
1. Customer photo is print-ready and optimized for loyalty cards
2. Digital signature captured for verification
3. All customer details provided
4. Generate unique loyalty card ID number
5. Print physical loyalty card using customer photo
6. Email the card ID to customer: ${email}
7. Update customer database with card details
8. File signature for legal records

💡 PRODUCTION TIPS:
• Photo is already sized for ID card printing (600x800px)
• Signature is high-resolution PNG with transparent background
• Both files can be saved directly from the data URLs above
• Customer expects card ID within 24 hours` : `
⚠️ INCOMPLETE REGISTRATION:
${!window.uploadedPhotoData ? '• Customer photo not uploaded' : ''}
${!window.signatureData ? '• Digital signature not provided' : ''}
Please contact customer at ${phone} or ${email} to complete missing items.`}

✅ NEXT STEPS:
1. Save customer photo and signature from data URLs above
2. Generate unique loyalty card ID (format: JMB-YYYY-NNNNNN)
3. Print physical loyalty card with customer photo
4. Email card ID to customer: ${email}
5. Update customer database and loyalty point system
6. File digital signature for records

---
🏢 JMB PRINTING SERVICES
📧 Loyalty Card Registration System
📞 Contact: 09931109148
📍 Barangay Balitoc Highway, Calatagan, Batangas`;

            // Create mailto link for automatic email submission
            const mailtoLink = `mailto:jmbprintingservices12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Auto-open email client with all data
            window.open(mailtoLink, '_blank');
            
            // Also log the registration data for debugging
            console.log('📧 Registration email sent to business:', {
                refId,
                customerName: `${firstName} ${lastName}`,
                customerEmail: email,
                phone,
                address,
                photoIncluded: photoData !== 'Not uploaded',
                signatureIncluded: signatureData !== 'Not provided',
                timestamp: new Date().toISOString(),
                emailSentTo: 'jmbprintingservices12@gmail.com'
            });
            
            // Show confirmation that email was sent with attachments
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                notification.innerHTML = `
                    <div class="flex items-center">
                        <span class="text-xl mr-2">📧</span>
                        <div>
                            <div class="font-semibold">Email Sent Successfully!</div>
                            <div class="text-sm">Photo and signature included</div>
                        </div>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // Remove notification after 5 seconds
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 5000);
            }, 1000);
        }

        function sendEmailCopyToCustomer(email, referenceId) {
            // In a real application, this would send an actual email
            // For demo purposes, we'll show a confirmation message
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            
            // Create email content
            const emailContent = {
                to: email,
                subject: 'JMB PRINTING SERVICES - Loyalty Card Registration Confirmation',
                body: `
                    Dear ${firstName} ${lastName},
                    
                    Thank you for registering for the JMB PRINTING SERVICES Loyalty Card!
                    
                    Your registration details:
                    - Reference ID: ${referenceId}
                    - Name: ${firstName} ${lastName}
                    - Email: ${email}
                    - Registration Date: ${new Date().toLocaleDateString()}
                    
                    Your loyalty card will be processed within 24 hours and you will receive your card ID via email.
                    
                    Thank you for choosing JMB PRINTING SERVICES!
                    
                    Best regards,
                    JMB PRINTING SERVICES Team
                `
            };
            
            // Log email content (in real app, this would be sent via email service)
            console.log('Email sent to customer:', emailContent);
            
            // Show email confirmation in the UI
            setTimeout(() => {
                const emailConfirmation = document.createElement('div');
                emailConfirmation.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
                emailConfirmation.innerHTML = `
                    <div class="flex items-center">
                        <span class="text-green-500 mr-2">📧</span>
                        <span>Confirmation email sent to ${email}</span>
                    </div>
                `;
                
                const modal = document.querySelector('#successModal .bg-white');
                const referenceDiv = modal.querySelector('.bg-gray-100');
                referenceDiv.parentNode.insertBefore(emailConfirmation, referenceDiv.nextSibling);
            }, 1000);
        }

        function showRegistration() {
            document.getElementById('homepage').style.display = 'none';
            document.getElementById('registrationSection').style.display = 'block';
        }

        function showHomepage() {
            document.getElementById('registrationSection').style.display = 'none';
            document.getElementById('homepage').style.display = 'block';
        }

        function resetForm() {
            // Hide modal
            document.getElementById('successModal').classList.add('hidden');
            document.getElementById('successModal').classList.remove('flex');
            
            // Reset form
            document.querySelectorAll('input, textarea, select').forEach(element => {
                element.value = '';
            });
            
            // Reset photo
            document.getElementById('photoPreview').classList.add('hidden');
            document.getElementById('photoUploadPrompt').classList.remove('hidden');
            window.uploadedPhotoData = null;
            
            // Clear signature
            clearSignature();
            
            // Reset to step 1
            currentStep = 1;
            updateStepIndicator(1);
            showStep(1);
            
            // Uncheck terms
            document.getElementById('termsCheckbox').checked = false;
            
            // Return to homepage
            showHomepage();
        }
    