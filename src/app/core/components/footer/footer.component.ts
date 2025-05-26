import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3 class="footer-logo">ProjectFlow</h3>
            <p class="footer-tagline">Simplify project management, amplify productivity</p>
          </div>
          
          <div class="footer-links">
            <div class="footer-links-group">
              <h4>Product</h4>
              <ul>
                <li><a routerLink="/features">Features</a></li>
                <li><a routerLink="/pricing">Pricing</a></li>
                <li><a routerLink="/roadmap">Roadmap</a></li>
              </ul>
            </div>
            
            <div class="footer-links-group">
              <h4>Resources</h4>
              <ul>
                <li><a routerLink="/docs">Documentation</a></li>
                <li><a routerLink="/guides">Guides</a></li>
                <li><a routerLink="/api">API</a></li>
              </ul>
            </div>
            
            <div class="footer-links-group">
              <h4>Company</h4>
              <ul>
                <li><a routerLink="/about">About</a></li>
                <li><a routerLink="/blog">Blog</a></li>
                <li><a routerLink="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div class="footer-links-group">
              <h4>Legal</h4>
              <ul>
                <li><a routerLink="/privacy">Privacy</a></li>
                <li><a routerLink="/terms">Terms</a></li>
                <li><a routerLink="/security">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} ProjectFlow. All rights reserved.</p>
          <div class="social-links">
            <a href="#" aria-label="Twitter" class="social-link">
              <span class="material-icons">alternate_email</span>
            </a>
            <a href="#" aria-label="LinkedIn" class="social-link">
              <span class="material-icons">work</span>
            </a>
            <a href="#" aria-label="GitHub" class="social-link">
              <span class="material-icons">code</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--neutral-900);
      color: var(--neutral-300);
      padding: var(--space-5) 0 var(--space-3);
    }
    
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-5);
      margin-bottom: var(--space-5);
    }
    
    .footer-brand {
      flex: 1 1 300px;
    }
    
    .footer-logo {
      color: white;
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-1);
    }
    
    .footer-tagline {
      color: var(--neutral-400);
      max-width: 300px;
    }
    
    .footer-links {
      flex: 2 1 600px;
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
    }
    
    .footer-links-group {
      flex: 1 1 150px;
    }
    
    .footer-links-group h4 {
      color: white;
      margin-bottom: var(--space-2);
      font-size: var(--font-size-md);
    }
    
    .footer-links-group ul {
      list-style: none;
      padding: 0;
    }
    
    .footer-links-group li {
      margin-bottom: var(--space-1);
    }
    
    .footer-links-group a {
      color: var(--neutral-400);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    
    .footer-links-group a:hover {
      color: white;
    }
    
    .footer-bottom {
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--neutral-800);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    
    .footer-bottom p {
      margin-bottom: 0;
    }
    
    .social-links {
      display: flex;
      gap: var(--space-2);
    }
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--neutral-800);
      color: var(--neutral-300);
      transition: all var(--transition-fast);
    }
    
    .social-link:hover {
      background-color: var(--primary-700);
      color: white;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}