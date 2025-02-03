const URL = "https://teachablemachine.withgoogle.com/models/b3k4etZDa/";

        let model, webcam, labelContainer, maxPredictions;
        let isFrozen = false;
        let animationFrameId;
        mode = "environment";

        async function init() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // Load the model and metadata
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            webcam = new tmImage.Webcam(1000, 1000); // Increased resolution for clearer image

            await webcam.setup({ facingMode: mode,frameRate: { ideal: 60, max: 999 }});
            await webcam.play();

            window.requestAnimationFrame(loop);

            // Add the webcam canvas to the DOM
            document.getElementById("webcam-container").appendChild(webcam.canvas);

            // Create labels for each prediction
            labelContainer = document.getElementById("label-container");
            for (let i = 0; i < maxPredictions; i++) {
                const labelDiv = document.createElement("div");
                labelDiv.classList.add("prediction-label");
                labelContainer.appendChild(labelDiv);
            }

            // Show the freeze button after webcam starts
            document.querySelector(".freeze-button-container").style.display = "inline";
            document.querySelector(".top-page").style.display = "none";
        }

        async function loop() {
            if (!isFrozen) {
                webcam.update(); // Update the webcam frame
                await predict();
                animationFrameId = window.requestAnimationFrame(loop); // Continue looping
            }
        }

        async function predict() {
            const prediction = await model.predict(webcam.canvas);
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }
        }

        function toggleFreeze() {
            isFrozen = !isFrozen;
            let currentLang = localStorage.getItem("language") || "en";
            document.getElementById("freeze-button").innerText = isFrozen  ?  (currentLang == "en" ? "Unfreeze" : "แสดงภาพต่อ") : (currentLang == "en" ? "Freeze" : "หยุดเฟรม");

            if (isFrozen) {
                window.cancelAnimationFrame(animationFrameId); // Stop the animation loop
            } else {
                window.requestAnimationFrame(loop); // Resume the animation loop
            }
        }

        async function changecam() {
            await webcam.stop();
            document.getElementById("webcam-container").removeChild(webcam.canvas);
            mode = mode === "user" ? "environment" : "user"; // Toggle between user and environment mode
            init();
        }

        const translations = {
            "th": { 
                "Appname": "ระบบพยากรณ์ความเสี่ยง<br>โรคต้อกระจก",
                "credit": "โดย<br><br>แผนการเรียนวิทย์-คณิต-คอม<br>โรงเรียนตราษตระการคุณ", 
                "start": "เริ่มการทำงาน" ,
                "freeze-button": "หยุดภาพ",
                "changecam": "สลับกล้อง",
                "swtchlang": "Change to English🇬🇧",
            },
            "en": { 
                "Appname": "CATARACT",
                "credit": "BY SMC TKSCHOOL", 
                "start": "Start" ,
                "freeze-button": "Freeze",
                "changecam": "ChangeCamera",
                "swtchlang": "เปลียนเป็นภาษาไทย🇹🇭", 
            }
        };
        
        let attribute = ["Appname", "credit", "start", "freeze-button", "changecam", "swtchlang"];

        function setLanguage(lang) {
            localStorage.setItem("language", lang);
            attribute.forEach((element) => {
                document.getElementById(element).innerHTML = translations[lang][element];
            });
        }

        function toggleLanguage() {
            let currentLang = localStorage.getItem("language") || "en";
            let newLang = currentLang === "th" ? "en" : "th";
            setLanguage(newLang);
            console.log("Switched to " + newLang);
        }

        // โหลดค่าภาษาเมื่อเปิดหน้าเว็บ
        window.onload = () => {
            let savedLang = localStorage.getItem("language") || "en";
            setLanguage(savedLang);
        };
        