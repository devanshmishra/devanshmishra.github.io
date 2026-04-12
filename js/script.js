    document.getElementById('year').textContent = new Date().getFullYear();

    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open);
      // Prevent body scroll when menu is open
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // restore scroll
      });
    });

    // Loader Logic & Sparkles
    let sparklesActive = false;
    
    // Minimal 5 second loader animation
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('is-hidden');
        setTimeout(() => {
          loader.remove();
          sparklesActive = true;
        }, 600);
      } else {
        sparklesActive = true;
      }
    }, 5000);

    // Sparkle Canvas Logic
    const canvas = document.getElementById('sparkles-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let w, h;
    
    if (canvas && ctx) {
      function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });

      class Particle {
        constructor() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.size = Math.random() * 2 + 0.5;
          this.baseX = this.x;
          this.baseY = this.y;
          this.density = (Math.random() * 30) + 1;
          this.color = `rgba(248, 231, 161, ${Math.random() * 0.8 + 0.2})`;
        }
        
        draw() {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
        
        update() {
          // Slow drift up
          this.y -= 0.5;
          if (this.y < -10) {
            this.y = h + 10;
            this.x = Math.random() * w;
            this.baseX = this.x;
            this.baseY = this.y;
          }

          // Mouse scatter interaction
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let maxDistance = 150;
          
          if (distance < maxDistance) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX * 2;
            this.y -= directionY * 2;
          } else {
            if (this.x !== this.baseX) {
              let dx2 = this.x - this.baseX;
              this.x -= dx2 / 20;
            }
          }
        }
      }

      function initParticles() {
        particles = [];
        for(let i = 0; i < 150; i++) {
          particles.push(new Particle());
        }
      }
      initParticles();

      function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        if (sparklesActive) {
            for(let i = 0; i < particles.length; i++) {
              particles[i].draw();
              particles[i].update();
            }
        }
        requestAnimationFrame(animateParticles);
      }
      animateParticles();
    }

    // Scroll Animation Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const scrollAnimObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // only animate once
        }
      });
    }, observerOptions);

    // Initial check for all animated elements
    document.addEventListener('DOMContentLoaded', () => {
      // Add animation classes dynamically to lists
      document.querySelectorAll('.service-card, .skill-group, .timeline-item, .edu-card').forEach((el) => {
        el.classList.add('anim-fade-up');
        // Add staggered delay depending on its index among siblings
        let index = Array.from(el.parentNode.children).indexOf(el);
        let delayClass = 'delay-' + ((index % 5) + 1);
        el.classList.add(delayClass);
      });

      // Add to hero left block and stats
      const heroContent = document.querySelector('.hero__content');
      if (heroContent) heroContent.classList.add('anim-fade-right');
      const heroPhoto = document.querySelector('.hero__photo');
      if (heroPhoto) heroPhoto.classList.add('anim-fade-left');
      
      document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale').forEach((el) => {
        scrollAnimObserver.observe(el);
      });

      // ── 3D TILT EFFECT ──
      document.querySelectorAll('figure, .service-card').forEach(block => {
        block.addEventListener('mousemove', (e) => {
          block.classList.add('is-tracking');
          const rect = block.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -10; 
          const rotateY = ((x - centerX) / centerX) * 10; 
          
          if (block.tagName.toLowerCase() === 'figure') {
            block.style.transform = `perspective(1200px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          } else {
            block.style.setProperty('--rx', `${rotateX}deg`);
            block.style.setProperty('--ry', `${rotateY}deg`);
          }
        });
        
        block.addEventListener('mouseleave', () => {
          block.classList.remove('is-tracking');
          if (block.tagName.toLowerCase() === 'figure') {
            block.style.transform = `perspective(1200px) scale(1) rotateX(0deg) rotateY(0deg)`;
          } else {
            block.style.setProperty('--rx', `0deg`);
            block.style.setProperty('--ry', `0deg`);
          }
        });
      });

      // ── INFINITE TYPING EFFECT ──
      const nameEl = document.getElementById('hero-name');
      if(nameEl) {
        const fullText = nameEl.textContent;
        nameEl.textContent = '';
        nameEl.classList.add('typewriter-cursor');
        
        const typeLoop = () => {
          let i = 0;
          nameEl.textContent = '';
          const typeWriter = setInterval(() => {
            nameEl.textContent += fullText.charAt(i);
            i++;
            if(i >= fullText.length) {
              clearInterval(typeWriter);
              setTimeout(() => {
                let j = fullText.length;
                const deleteWriter = setInterval(() => {
                  nameEl.textContent = fullText.substring(0, j);
                  j--;
                  if (j < 0) {
                    clearInterval(deleteWriter);
                    setTimeout(typeLoop, 500); 
                  }
                }, 50);
              }, 3000); 
            }
          }, 100); 
        };

        setTimeout(typeLoop, 5500);
      }

      // ── H2 SHIMMER EFFECT OBSERVER ──
      const headingObserver = new IntersectionObserver((entries, obs) => {
         entries.forEach(entry => {
           if(entry.isIntersecting) {
             entry.target.classList.add('shimmer-anim');
             obs.unobserve(entry.target);
           }
         });
      }, { threshold: 0.5 });
      
      document.querySelectorAll('h2.section-title, h2.cta__heading').forEach(h2 => headingObserver.observe(h2));

      // ── HERO STATS COUNTING ANIMATION ──
      const statValues = document.querySelectorAll('.stat__value');
      if (statValues.length > 0) {
        const animateStats = () => {
          statValues.forEach(el => {
            const finalValueText = el.textContent;
            const targetNum = parseInt(finalValueText);
            const suffix = finalValueText.replace(/[0-9]/g, '').trim(); 
            
            let startTimestamp = null;
            const duration = 2500; // Count over 2.5 seconds
            
            const step = (timestamp) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              // Decelerating ease-out curve
              const easeOut = progress * (2 - progress);
              const currentNum = Math.floor(easeOut * targetNum);
              
              el.textContent = `${currentNum}${suffix}`;
              
              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                el.textContent = `${targetNum}${suffix}`;
              }
            };
            
            window.requestAnimationFrame(step);
          });
        };

        // Synchronize carefully with 3D loader exit
        setTimeout(animateStats, 5200); 
      }

      // ── BRAND STRIP PHYSICS ──
      const stripInner = document.querySelector('.brand-strip__inner');
      const brandItems = Array.from(document.querySelectorAll('.brand-item'));
      if (stripInner && brandItems.length > 0) {
        let brandPhysics = [];
        let physicsActive = false;
        
        setTimeout(() => {
          brandItems.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const parentRect = stripInner.getBoundingClientRect();
            brandPhysics.push({
              el: el,
              x: (rect.left - parentRect.left) + rect.width / 2,
              y: (rect.top - parentRect.top) + rect.height / 2,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              radius: rect.width / 2,
              baseX: (rect.left - parentRect.left) + rect.width / 2,
              baseY: (rect.top - parentRect.top) + rect.height / 2,
            });
            el.style.position = 'absolute';
            el.style.margin = '0';
          });
          
          brandItems.forEach((el, i) => {
            el.style.left = `${brandPhysics[i].x - brandPhysics[i].radius}px`;
            el.style.top = `${brandPhysics[i].y - brandPhysics[i].radius}px`;
          });
          
          physicsActive = true;
          requestAnimationFrame(updateBrandPhysics);
        }, 1000); 
        
        let stripMouse = { x: -1000, y: -1000, active: false };
        stripInner.addEventListener('mousemove', (e) => {
          const rect = stripInner.getBoundingClientRect();
          stripMouse.x = e.clientX - rect.left;
          stripMouse.y = e.clientY - rect.top;
          stripMouse.active = true;
        });
        stripInner.addEventListener('mouseleave', () => {
          stripMouse.active = false;
        });

        // Touch support for mobile
        stripInner.addEventListener('touchstart', (e) => {
          stripMouse.active = true;
        });
        stripInner.addEventListener('touchmove', (e) => {
          if (e.touches.length > 0) {
            const rect = stripInner.getBoundingClientRect();
            stripMouse.x = e.touches[0].clientX - rect.left;
            stripMouse.y = e.touches[0].clientY - rect.top;
            stripMouse.active = true;
          }
        }, { passive: true });
        stripInner.addEventListener('touchend', () => {
          stripMouse.active = false;
        });
        
        function updateBrandPhysics() {
          if (!physicsActive) return;
          const parentWidth = stripInner.offsetWidth;
          const parentHeight = stripInner.offsetHeight;

          brandPhysics.forEach(b => {
            if (stripMouse.active) {
              let dx = stripMouse.x - b.x;
              let dy = stripMouse.y - b.y;
              let dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 200) { // Strong Repulsion
                b.vx -= (dx / dist) * 2.5;
                b.vy -= (dy / dist) * 2.5;
              }
              // Add friction when interacting so they don't fly out of control
              b.vx *= 0.93;
              b.vy *= 0.93;
            } else {
              // Continuous zigzag floating movement
              b.vx += (Math.random() - 0.5) * 0.2;
              b.vy += (Math.random() - 0.5) * 0.2;
              
              // Cap max floating speed to keep it slow & elegant
              let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              let maxSpeed = 1.2;
              if (speed > maxSpeed) {
                b.vx = (b.vx / speed) * maxSpeed;
                b.vy = (b.vy / speed) * maxSpeed;
              }
            }

            b.x += b.vx;
            b.y += b.vy;

            // Simple boundary bounce
            if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -1; }
            if (b.x + b.radius > parentWidth) { b.x = parentWidth - b.radius; b.vx *= -1; }
            if (b.y - b.radius < 0) { b.y = b.radius; b.vy *= -1; }
            if (b.y + b.radius > parentHeight) { b.y = parentHeight - b.radius; b.vy *= -1; }
          });

          // Circle collisions
          for(let i=0; i < brandPhysics.length; i++) {
            for(let j=i+1; j < brandPhysics.length; j++) {
              let b1 = brandPhysics[i];
              let b2 = brandPhysics[j];
              let dx = b2.x - b1.x;
              let dy = b2.y - b1.y;
              let dist = Math.sqrt(dx*dx + dy*dy);
              let minDist = b1.radius + b2.radius;
              if (dist < minDist) {
                let angle = Math.atan2(dy, dx);
                let targetX = b1.x + Math.cos(angle) * minDist;
                let targetY = b1.y + Math.sin(angle) * minDist;
                let ax = (targetX - b2.x) * 0.3;
                let ay = (targetY - b2.y) * 0.3;
                b1.vx -= ax; b1.vy -= ay;
                b2.vx += ax; b2.vy += ay;
                b1.x -= ax*0.5; b1.y -= ay*0.5;
                b2.x += ax*0.5; b2.y += ay*0.5;
              }
            }
          }

          brandPhysics.forEach(b => {
            b.el.style.left = `${b.x - b.radius}px`;
            b.el.style.top = `${b.y - b.radius}px`;
          });
          requestAnimationFrame(updateBrandPhysics);
        }
      }
    });