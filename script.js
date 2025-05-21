document.addEventListener('DOMContentLoaded', function() {
    // Elemen-elemen DOM
    const processCountInput = document.getElementById('process-count');
    const generateTableBtn = document.getElementById('generate-table');
    const processTbody = document.getElementById('process-tbody');
    const calculateBtn = document.getElementById('calculate-button');
    const quantumInput = document.getElementById('quantum');
    const initialGanttSection = document.getElementById('initial-gantt');
    const algorithmResults = document.getElementById('algorithm-results');
    
    let processesData = [];
  
    // Event listeners
    generateTableBtn.addEventListener('click', generateProcessTable);
    calculateBtn.addEventListener('click', simulateAlgorithms);
    
    // Menghasilkan tabel proses berdasarkan jumlah yang dimasukkan
    function generateProcessTable() {
        const processCount = parseInt(processCountInput.value);
        if (processCount < 1 || processCount > 10) {
            alert('Jumlah proses harus antara 1 dan 10');
            return;
        }
        
        processTbody.innerHTML = '';
        for (let i = 0; i < processCount; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>P${i+1}</td>
                <td><input type="number" class="burst-time" min="1" value="${Math.floor(Math.random() * 10) + 1}" required></td>
            `;
            processTbody.appendChild(row);
        }
        
        // Reset sections
        initialGanttSection.style.display = 'none';
        algorithmResults.style.display = 'none';
    }
    
    // Generate process table by default
    generateProcessTable();
    
    // Fungsi utama untuk mensimulasikan semua algoritma
    function simulateAlgorithms() {
        // Mendapatkan data proses dari input
        processesData = [];
        const rows = processTbody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            const burstTimeInput = row.querySelector('.burst-time');
            const burstTime = parseInt(burstTimeInput.value);
            
            if (isNaN(burstTime) || burstTime < 1) {
                alert(`Harap masukkan nilai valid untuk Proses ${index + 1}`);
                return;
            }
            
            // Set arrival time berdasarkan urutan (0, 1, 2, dst)
            processesData.push({
                id: index + 1,
                name: `P${index + 1}`,
                arrivalTime: index, // Arrival time otomatis berdasarkan urutan
                burstTime: burstTime,
                remainingTime: burstTime
            });
        });
        
        if (processesData.length === 0) {
            alert('Harap masukkan setidaknya satu proses');
            return;
        }
        
        const quantum = parseInt(quantumInput.value);
        if (isNaN(quantum) || quantum < 1) {
            alert('Quantum harus lebih besar dari 0');
            return;
        }
        
        // Tampilkan Gantt chart awal (urutan proses)
        displayInitialGantt(processesData);
        initialGanttSection.style.display = 'block';
        
        // Jalankan semua algoritma
        const fcfsResult = fcfsAlgorithm(JSON.parse(JSON.stringify(processesData)));
        const sjfResult = sjfAlgorithm(JSON.parse(JSON.stringify(processesData)));
        const rrResult = rrAlgorithm(JSON.parse(JSON.stringify(processesData)), quantum);
        
        // Tampilkan hasil algoritma
        displayResult('fcfs', fcfsResult);
        displayResult('sjf', sjfResult);
        displayResult('rr', rrResult);
        
        // Tampilkan perbandingan algoritma
        displayComparison([
            { name: 'FCFS', avgWaiting: fcfsResult.avgWaitingTime, avgTurnaround: fcfsResult.avgTurnaroundTime },
            { name: 'SJF', avgWaiting: sjfResult.avgWaitingTime, avgTurnaround: sjfResult.avgTurnaroundTime },
            { name: 'Round Robin', avgWaiting: rrResult.avgWaitingTime, avgTurnaround: rrResult.avgTurnaroundTime }
        ]);
        
        // Tampilkan hasil algoritma
        algorithmResults.style.display = 'block';
    }
    
    // Menampilkan Gantt chart awal
    function displayInitialGantt(processes) {
        const ganttChartElement = document.getElementById('initial-gantt-chart');
        ganttChartElement.innerHTML = '';
        
        let currentTime = 0;
        const ganttChart = [];
        
        // Buat Gantt chart sederhana berdasarkan proses dalam urutan inputnya
        processes.forEach(process => {
            ganttChart.push({
                processName: process.name,
                startTime: currentTime,
                endTime: currentTime + process.burstTime
            });
            
            currentTime += process.burstTime;
        });
        
        // Tampilkan Gantt chart
        displayGanttChart(ganttChartElement, ganttChart, processes);
    }
    
    // Algoritma First Come First Serve (FCFS)
    function fcfsAlgorithm(processes) {
      let currentTime = 0;
      const ganttChart = [];
      const results = [];
      
      let totalWaitingTime = 0;
      let totalTurnaroundTime = 0;
      
      for (let i = 0; i < processes.length; i++) {
          const process = processes[i];
  
          const startTime = currentTime;
          const completionTime = startTime + process.burstTime;
          const waitingTime = startTime; // Karena semua arrivalTime dianggap 0
          const turnaroundTime = completionTime; // Karena arrivalTime = 0
          
          ganttChart.push({
              processName: process.name || `P${i + 1}`,
              startTime: startTime,
              endTime: completionTime
          });
  
          currentTime = completionTime;
          
          results.push({
              id: process.id,
              name: process.name || `P${i + 1}`,
              burstTime: process.burstTime,
              startTime: startTime,
              completionTime: completionTime,
              waitingTime: waitingTime,
              turnaroundTime: turnaroundTime
          });
  
          totalWaitingTime += waitingTime;
          totalTurnaroundTime += turnaroundTime;
      }
      
      const avgWaitingTime = parseFloat((totalWaitingTime / processes.length).toFixed(2));
      const avgTurnaroundTime = parseFloat((totalTurnaroundTime / processes.length).toFixed(2));
      
      return {
          processes: results,
          ganttChart: ganttChart,
          avgWaitingTime,
          avgTurnaroundTime
      };
  }
  
  
  
  
  function sjfAlgorithm(processes) {
      // Urutkan proses berdasarkan burst time terkecil
      processes.sort((a, b) => a.burstTime - b.burstTime);
  
      let currentTime = 0;
      const ganttChart = [];
      const completionTimes = {};
      const startTimes = {};
  
      // Eksekusi setiap proses secara berurutan
      processes.forEach(process => {
          startTimes[process.id] = currentTime;
  
          ganttChart.push({
              processName: process.name,
              startTime: currentTime,
              endTime: currentTime + process.burstTime
          });
  
          currentTime += process.burstTime;
          completionTimes[process.id] = currentTime;
      });
  
      // Hitung waiting time dan turnaround time
      let totalWaitingTime = 0;
      let totalTurnaroundTime = 0;
  
      processes.forEach(process => {
          const completionTime = completionTimes[process.id];
          const startTime = startTimes[process.id];
          const turnaroundTime = completionTime; // arrivalTime diasumsikan 0
          const waitingTime = startTime; // Karena arrivalTime 0 semua, waitingTime = startTime
  
          process.startTime = startTime;
          process.completionTime = completionTime;
          process.turnaroundTime = turnaroundTime;
          process.waitingTime = waitingTime;
  
          totalWaitingTime += waitingTime;
          totalTurnaroundTime += turnaroundTime;
      });
  
      return {
          processes: processes,
          ganttChart: ganttChart,
          avgWaitingTime: totalWaitingTime / processes.length,
          avgTurnaroundTime: totalTurnaroundTime / processes.length
      };
  }
  
  
  function rrAlgorithm(processes, quantum) {
      // Salin remaining time dari burst time
      processes.forEach(p => {
          p.remainingTime = p.burstTime;
      });
      
      let currentTime = 0;
      const ganttChart = [];
      const completionTimes = {};
      const readyQueue = [];
      let allCompleted = false;
      
      // Mulai dengan memasukkan proses pertama ke ready queue
      readyQueue.push(...processes);
      
      while (!allCompleted) {
          if (readyQueue.length === 0) {
              // Jika ready queue kosong dan semua proses sudah selesai
              allCompleted = true;
          } else {
              // Ambil proses pertama dalam ready queue
              const currentProcess = readyQueue.shift();
              
              // Tentukan waktu eksekusi
              const executeTime = Math.min(quantum, currentProcess.remainingTime);
              const endTimeSlice = currentTime + executeTime;
              
              // Eksekusi proses
              ganttChart.push({
                  processName: currentProcess.name,
                  startTime: currentTime,
                  endTime: endTimeSlice
              });
              
              currentTime = endTimeSlice;
              currentProcess.remainingTime -= executeTime;
              
              // Jika proses belum selesai, masukkan kembali ke ready queue
              if (currentProcess.remainingTime > 0) {
                  readyQueue.push(currentProcess);
              } else {
                  // Proses selesai
                  completionTimes[currentProcess.id] = currentTime;
              }
          }
          
          // Periksa apakah semua proses sudah selesai
          allCompleted = processes.every(p => p.remainingTime === 0 || completionTimes[p.id]);
      }
      
      // Hitung waiting time dan turnaround time
      let totalWaitingTime = 0;
      let totalTurnaroundTime = 0;
      
      processes.forEach(process => {
          const completionTime = completionTimes[process.id];
          const turnaroundTime = completionTime;  // Karena arrival time = 0
          const waitingTime = turnaroundTime - process.burstTime;
          
          process.completionTime = completionTime;
          process.turnaroundTime = turnaroundTime;
          process.waitingTime = waitingTime;
          
          totalWaitingTime += waitingTime;
          totalTurnaroundTime += turnaroundTime;
      });
      
      return {
          processes: processes,
          ganttChart: ganttChart,
          avgWaitingTime: totalWaitingTime / processes.length,
          avgTurnaroundTime: totalTurnaroundTime / processes.length
      };
  }
  
  
    // Menampilkan Gantt chart
  // Fungsi untuk menampilkan Gantt chart dengan animasi otomatis
  
  // Fungsi untuk menampilkan Gantt chart dengan animasi pergeseran
  function displayGanttChart(container, ganttChart, processes) {
      container.innerHTML = '';
      
      const colors = {
          'Idle': '#cccccc'
      };
      
      // Tetapkan warna untuk setiap proses
      processes.forEach((process, index) => {
          colors[process.name] = getProcessColor(index);
      });
      
      // Buat tombol simulasi
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'simulation-controls';
      
      const simulateBtn = document.createElement('button');
      simulateBtn.textContent = 'Simulasi Ulang';
      simulateBtn.className = 'simulate-button';
      controlsDiv.appendChild(simulateBtn);
      
      container.appendChild(controlsDiv);
      
      // Buat container untuk posisi proses awal (P1, P2, P3)
      const initialContainer = document.createElement('div');
      initialContainer.className = 'initial-processes-container';
      container.appendChild(initialContainer);
      
      // Buat container untuk posisi akhir (hasil algoritma)
      const finalContainer = document.createElement('div');
      finalContainer.className = 'final-processes-container';
      finalContainer.style.display = 'none'; // Sembunyikan dulu
      container.appendChild(finalContainer);
      
      // Buat representasi visual proses awal berdasarkan urutan P1, P2, P3
      const sortedProcesses = [...processes].sort((a, b) => {
          const numA = parseInt(a.name.replace('P', ''));
          const numB = parseInt(b.name.replace('P', ''));
          return numA - numB;
      });
      
      // Buat blok untuk urutan proses awal
      sortedProcesses.forEach(process => {
          const processBlock = document.createElement('div');
          processBlock.className = 'gantt-block process-block';
          processBlock.id = `initial-${process.name}`;
          processBlock.style.backgroundColor = colors[process.name];
          processBlock.style.width = `${process.burstTime * 30}px`;
          processBlock.style.opacity = '0'; // Sembunyikan dulu
          
          const processLabel = document.createElement('div');
          processLabel.className = 'process-label';
          processLabel.textContent = process.name;
          processBlock.appendChild(processLabel);
          
          const burstLabel = document.createElement('div');
          burstLabel.className = 'burst-label';
          burstLabel.textContent = `Burst: ${process.burstTime}`;
          processBlock.appendChild(burstLabel);
          
          initialContainer.appendChild(processBlock);
      });
      
      // membuat blok untuk hasil algoritma
      ganttChart.forEach((block, index) => {
          const ganttBlock = document.createElement('div');
          ganttBlock.className = 'gantt-block result-block';
          ganttBlock.style.backgroundColor = colors[block.processName] || '#999999';
          ganttBlock.style.width = `${(block.endTime - block.startTime) * 30}px`;
          ganttBlock.style.opacity = '0'; // disembunyikan dulu
          
          // Label proses
          const processLabel = document.createElement('div');
          processLabel.className = 'process-label';
          processLabel.textContent = block.processName;
          ganttBlock.appendChild(processLabel);
          
          // Label waktu
          if (block === ganttChart[0] || block.startTime > ganttChart[ganttChart.indexOf(block) - 1].endTime) {
              const startLabel = document.createElement('div');
              startLabel.className = 'time-label';
              startLabel.style.left = '0';
              startLabel.textContent = block.startTime;
              ganttBlock.appendChild(startLabel);
          }
          
          const endLabel = document.createElement('div');
          endLabel.className = 'time-label';
          endLabel.style.right = '0';
          endLabel.textContent = block.endTime;
          ganttBlock.appendChild(endLabel);
          
          finalContainer.appendChild(ganttBlock);
      });
      
      // Fungsi untuk menjalankan animasi
      function runAnimation() {
          // Reset semua
          initialContainer.style.display = 'flex';
          finalContainer.style.display = 'none';
          
          const initialBlocks = initialContainer.querySelectorAll('.process-block');
          const resultBlocks = finalContainer.querySelectorAll('.result-block');
          
          // Fase 1: Tampilkan proses berdasarkan urutan P1, P2, P3
          let delay = 0;
          initialBlocks.forEach((block, index) => {
              setTimeout(() => {
                  block.style.opacity = '1';
                  block.classList.add('active-block');
                  
                  // Hapus highlight setelah beberapa saat
                  setTimeout(() => {
                      block.classList.remove('active-block');
                  }, 1000);
              }, delay);
              delay += 1000;
          });
          
          // Tambahkan text menjelaskan simulasi sedang berlangsung
          const infoText = document.createElement('div');
          infoText.className = 'info-text';
          infoText.textContent = 'Menampilkan proses sesuai urutan input...';
          setTimeout(() => {
              container.insertBefore(infoText, initialContainer);
          }, delay);
          
          // Fase 2: Transisi ke hasil algoritma
          setTimeout(() => {
              infoText.textContent = 'Proses bergeser sesuai hasil algoritma...';
              
              // Hitung posisi untuk animasi
              const processPositions = {};
              
              // Catat posisi awal setiap proses
              initialBlocks.forEach(block => {
                  const processName = block.querySelector('.process-label').textContent;
                  const rect = block.getBoundingClientRect();
                  processPositions[processName] = {
                      initial: {
                          left: rect.left,
                          width: rect.width
                      }
                  };
              });
              
              // Tampilkan container hasil, tapi blok masih tersembunyi
              finalContainer.style.display = 'flex';
              
              // Catat posisi blok hasil
              resultBlocks.forEach(block => {
                  const processName = block.querySelector('.process-label').textContent;
                  const rect = block.getBoundingClientRect();
                  
                  if (processPositions[processName]) {
                      processPositions[processName].final = {
                          left: rect.left - 400,
                          width: rect.width
                      };
                  }
              });
              
              // Sembunyikan container hasil lagi
              finalContainer.style.display = 'none';
              
              // Buat elemen klon untuk animasi pergeseran
              Object.keys(processPositions).forEach(processName => {
                  if (processPositions[processName].initial && processPositions[processName].final) {
                      const pos = processPositions[processName];
                      
                      const movingBlock = document.createElement('div');
                      movingBlock.className = 'gantt-block moving-block';
                      movingBlock.style.backgroundColor = colors[processName];
                      movingBlock.style.width = `${pos.initial.width}px`;
                      movingBlock.style.position = 'absolute';
                      movingBlock.style.left = `${pos.initial.left - initialContainer.getBoundingClientRect().left}px`;
                      
                      const processLabel = document.createElement('div');
                      processLabel.className = 'process-label';
                      processLabel.textContent = processName;
                      movingBlock.appendChild(processLabel);
                      
                      container.appendChild(movingBlock);
                      
                      // Animasi pergeseran
                      setTimeout(() => {
                          // Animasi perubahan posisi dan ukuran
                          movingBlock.style.transition = 'left 1.5s ease','width 1.5s ease';
                          movingBlock.style.left = `${pos.final.left - initialContainer.getBoundingClientRect().left}px`;
                          movingBlock.style.width = `${pos.final.width}px`;
                          
                          // Highlight selama bergeser
                          movingBlock.classList.add('active-block');
                      }, 700);
                  }
              });
              
              // Sembuyikan blok proses awal
              initialBlocks.forEach(block => {
                  block.style.opacity = '0';
              });
              
              // Fase 3: Tampilkan hasil akhir
              setTimeout(() => {
                  // Hapus blok yang bergerak
                  const movingBlocks = container.querySelectorAll('.moving-block');
                  movingBlocks.forEach(block => block.remove());
                  
                  // Hapus pesan info
                  infoText.remove();
                  
                  // Sembunyikan container awal dan tampilkan container hasil
                  initialContainer.style.display = 'none';
                  finalContainer.style.display = 'flex';
                  
                  // Tampilkan blok hasil
                  resultBlocks.forEach((block, i) => {
                      setTimeout(() => {
                          block.style.opacity = '1';
                          block.classList.add('active-block');
                          
                          setTimeout(() => {
                              block.classList.remove('active-block');
                          }, 2000);
                      }, i * 2000);
                  });
                  
                  
              }, 2000); // Waktu untuk animasi pergeseran
              
          }, delay + 1000);
      }
      
      // Jalankan animasi saat pertama kali
      setTimeout(runAnimation, 500);
      
      // Tambahkan event listener untuk tombol simulasi ulang
      simulateBtn.addEventListener('click', runAnimation);
  }
  
  
    // Menampilkan hasil algoritma
    function displayResult(algorithmId, result) {
        // Tampilkan Gantt Chart
        const ganttChartElement = document.getElementById(`${algorithmId}-gantt-chart`);
        displayGanttChart(ganttChartElement, result.ganttChart, result.processes);
        
        // Tampilkan average waiting time dan turnaround time
        document.getElementById(`${algorithmId}-avg-waiting`).textContent = 
            result.avgWaitingTime.toFixed(2);
        document.getElementById(`${algorithmId}-avg-turnaround`).textContent = 
            result.avgTurnaroundTime.toFixed(2);
    }
    
    // Menampilkan perbandingan algoritma
    function displayComparison(algorithms) {
        const comparisonTbody = document.getElementById('comparison-tbody');
        comparisonTbody.innerHTML = '';
        
        // Sort algoritma berdasarkan average waiting time
        algorithms.sort((a, b) => a.avgWaiting - b.avgWaiting);
        
        algorithms.forEach((algorithm, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${algorithm.name}</td>
                <td>${algorithm.avgWaiting.toFixed(2)}</td>
                <td>${algorithm.avgTurnaround.toFixed(2)}</td>
                <td>${index + 1}</td>
            `;
            
            // Highlight algoritma terbaik
            if (index === 0) {
                row.classList.add('best-algorithm');
            }
            
            comparisonTbody.appendChild(row);
        });
    }
    
    // Warna untuk proses
    function getProcessColor(index) {
        const colors = [
            '#3498db', // Biru
            '#e74c3c', // Merah
            '#2ecc71', // Hijau
            '#f39c12', // Oranye
            '#9b59b6', // Ungu
            '#1abc9c', // Tosca
            '#34495e', // Biru Tua
            '#d35400', // Coklat
            '#16a085', // Hijau Biru
            '#c0392b'  // Merah Tua
        ];
        
        return colors[index % colors.length];
    }
  });