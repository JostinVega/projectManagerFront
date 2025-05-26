import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title slide-in-up">Simplify Your <span class="text-accent">Project Management</span></h1>
            <p class="hero-subtitle slide-in-up">A powerful, intuitive platform for teams to collaborate, organize tasks, and deliver projects on time.</p>
            <div class="hero-buttons slide-in-up">
              <a routerLink="/auth/register" class="btn btn-primary">Get Started Free</a>
              <a routerLink="/demo" class="btn btn-outline">View Demo</a>
            </div>
          </div>
          <div class="hero-image slide-in-up">
            <img src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Project Management Dashboard" class="dashboard-preview">
          </div>
        </div>
      </section>
      
      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <div class="section-header">
            <h2>Everything You Need to Manage Projects</h2>
            <p>Our platform provides all the tools you need to organize, track, and deliver projects successfully.</p>
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon bg-primary">
                <span class="material-icons">assignment</span>
              </div>
              <h3>Task Management</h3>
              <p>Create, assign, and track tasks with deadlines, priorities, and detailed descriptions.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon bg-secondary">
                <span class="material-icons">dashboard</span>
              </div>
              <h3>Kanban Boards</h3>
              <p>Visualize workflows with customizable Kanban boards to track progress at a glance.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon bg-accent">
                <span class="material-icons">groups</span>
              </div>
              <h3>Team Collaboration</h3>
              <p>Collaborate seamlessly with team members across departments and locations.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon bg-success">
                <span class="material-icons">notifications</span>
              </div>
              <h3>Real-time Updates</h3>
              <p>Stay informed with instant notifications about project changes and updates.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon bg-warning">
                <span class="material-icons">assessment</span>
              </div>
              <h3>Progress Tracking</h3>
              <p>Monitor project progress with visual indicators and status updates.</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon bg-error">
                <span class="material-icons">lock</span>
              </div>
              <h3>Role-Based Access</h3>
              <p>Control who can view and modify project data with granular permissions.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Testimonials Section -->
      <section class="testimonials">
        <div class="container">
          <div class="section-header">
            <h2>Trusted by Teams Everywhere</h2>
            <p>See what our customers say about our project management solution.</p>
          </div>
          
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"This platform transformed how our team coordinates projects. We've seen a 40% increase in on-time deliveries since implementation."</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <span class="author-initials">JD</span>
                </div>
                <div class="author-info">
                  <h4>Jane Doe</h4>
                  <p>Project Manager, Acme Inc.</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"The intuitive interface and powerful features have made project tracking a breeze. Our team loves the Kanban board visualization."</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <span class="author-initials">MS</span>
                </div>
                <div class="author-info">
                  <h4>Mark Smith</h4>
                  <p>CTO, Tech Innovations</p>
                </div>
              </div>
            </div>
            
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"We've reduced meeting time by 30% since adopting this tool. Everyone knows what they need to do and when it's due."</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <span class="author-initials">LJ</span>
                </div>
                <div class="author-info">
                  <h4>Lisa Johnson</h4>
                  <p>Team Lead, Global Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA Section -->
      <section class="cta">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Transform Your Project Management?</h2>
            <p>Join thousands of teams already using our platform to deliver projects on time and within budget.</p>
            <a routerLink="/auth/register" class="btn btn-primary btn-lg">Start Your Free Trial</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Hero Section */
    .hero {
      padding: var(--space-5) 0;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--neutral-50) 100%);
      overflow: hidden;
    }
    
    .hero .container {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    
    .hero-content {
      flex: 1;
    }
    
    .hero-title {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-3);
      line-height: 1.2;
    }
    
    .text-accent {
      color: var(--primary-700);
    }
    
    .hero-subtitle {
      font-size: var(--font-size-lg);
      color: var(--neutral-700);
      margin-bottom: var(--space-4);
      max-width: 600px;
    }
    
    .hero-buttons {
      display: flex;
      gap: var(--space-2);
    }
    
    .btn-outline {
      background-color: transparent;
      border: 2px solid var(--primary-500);
      color: var(--primary-500);
    }
    
    .btn-outline:hover {
      background-color: var(--primary-50);
    }
    
    .hero-image {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    
    .dashboard-preview {
      max-width: 100%;
      height: auto;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
    }
    
    /* Features Section */
    .features {
      padding: var(--space-6) 0;
      background-color: white;
    }
    
    .section-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto var(--space-5);
    }
    
    .section-header h2 {
      margin-bottom: var(--space-2);
      font-size: var(--font-size-3xl);
      color: var(--neutral-900);
    }
    
    .section-header p {
      color: var(--neutral-600);
      font-size: var(--font-size-lg);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }
    
    .feature-card {
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }
    
    .feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      margin-bottom: var(--space-2);
      color: white;
    }
    
    .feature-card h3 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-2);
      color: var(--neutral-900);
    }
    
    .feature-card p {
      color: var(--neutral-600);
      line-height: 1.6;
    }
    
    /* Testimonials Section */
    .testimonials {
      padding: var(--space-6) 0;
      background-color: var(--neutral-50);
    }
    
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }
    
    .testimonial-card {
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
    }
    
    .testimonial-content {
      margin-bottom: var(--space-3);
    }
    
    .testimonial-content p {
      color: var(--neutral-700);
      font-size: var(--font-size-md);
      line-height: 1.6;
      font-style: italic;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--primary-100);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .author-initials {
      font-weight: var(--font-weight-medium);
      color: var(--primary-700);
    }
    
    .author-info h4 {
      font-size: var(--font-size-md);
      margin-bottom: 4px;
      color: var(--neutral-900);
    }
    
    .author-info p {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
    }
    
    /* CTA Section */
    .cta {
      padding: var(--space-6) 0;
      background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%);
      color: white;
    }
    
    .cta-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .cta-content h2 {
      font-size: var(--font-size-3xl);
      margin-bottom: var(--space-3);
    }
    
    .cta-content p {
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-4);
      color: var(--neutral-200);
    }
    
    .btn-lg {
      padding: var(--space-1) var(--space-4);
      font-size: var(--font-size-lg);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero .container {
        flex-direction: column;
        text-align: center;
      }
      
      .hero-title {
        font-size: var(--font-size-3xl);
      }
      
      .hero-buttons {
        justify-content: center;
      }
      
      .hero-image {
        margin-top: var(--space-4);
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {}