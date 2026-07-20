import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const aboutContent: Record<string, { title: string; content: string }> = {
  'contact-us': {
    title: 'Contact Us',
    content: `
      <h2>Contact Us</h2>
      <p>We're here to help! Reach out to us through any of the following channels:</p>
      
      <h3>Customer Support</h3>
      <p><strong>Email:</strong> support@flipkartclone.com</p>
      <p><strong>Phone:</strong> +91-9876543210</p>
      <p><strong>Timings:</strong> Mon-Sat, 9:00 AM – 9:00 PM (IST)</p>
      
      <h3>Corporate Office</h3>
      <p>Flipkart Clone Pvt. Ltd.</p>
      <p>Building Alyssa, Begonia &amp; Clove Embassy Tech Village,</p>
      <p>Bengaluru, 560103, Karnataka, India</p>
      
      <h3>Social Media</h3>
      <p>Follow us on <a href="#">Facebook</a>, <a href="#">Twitter</a>, <a href="#">Instagram</a></p>
    `
  },
  'about-us': {
    title: 'About Us',
    content: `
      <h2>About Flipkart Clone</h2>
      <p>Flipkart Clone is a demo e-commerce platform inspired by India's leading online marketplace, Flipkart.</p>
      
      <h3>Our Mission</h3>
      <p>To provide a seamless shopping experience with a wide range of products at competitive prices.</p>
      
      <h3>Our Vision</h3>
      <p>To become the most trusted and customer-centric e-commerce platform in India.</p>
      
      <h3>Our Values</h3>
      <ul>
        <li><strong>Customer First</strong> – Everything we do starts with the customer.</li>
        <li><strong>Innovation</strong> – We constantly innovate to improve our platform.</li>
        <li><strong>Integrity</strong> – We operate with honesty and transparency.</li>
        <li><strong>Collaboration</strong> – We work together to achieve great results.</li>
      </ul>
      
      <p>This is a demo project built with Next.js, Tailwind CSS, and Zustand. It showcases modern web development practices.</p>
    `
  },
  'careers': {
    title: 'Careers',
    content: `
      <h2>Careers at Flipkart Clone</h2>
      <p>Join our team and help us build the future of e-commerce in India!</p>
      
      <h3>Current Openings</h3>
      <ul>
        <li><strong>Frontend Developer</strong> – Bangalore (3+ years experience in React/Next.js)</li>
        <li><strong>Backend Developer</strong> – Bangalore (5+ years experience in Node.js/PostgreSQL)</li>
        <li><strong>Product Manager</strong> – Bangalore (4+ years experience in e-commerce)</li>
        <li><strong>Data Analyst</strong> – Bangalore (2+ years experience in SQL/Python)</li>
        <li><strong>Customer Support Executive</strong> – Bangalore (Freshers can apply)</li>
      </ul>
      
      <h3>How to Apply</h3>
      <p>Send your resume to <strong>careers@flipkartclone.com</strong> with the position name in the subject line.</p>
      
      <h3>Why Join Us?</h3>
      <ul>
        <li>Competitive salary &amp; benefits</li>
        <li>Work with cutting-edge technology</li>
        <li>Fast-paced, collaborative culture</li>
        <li>Opportunities for growth and learning</li>
      </ul>
    `
  },
  'flipkart-stories': {
    title: 'Flipkart Stories',
    content: `
      <h2>Flipkart Stories</h2>
      <p>Discover the latest stories, updates, and behind-the-scenes from Flipkart Clone.</p>
      
      <h3>Our Journey</h3>
      <p>Flipkart Clone started as a small project to replicate the popular Flipkart experience. Over time, it has grown into a fully functional e-commerce platform.</p>
      
      <h3>Tech Stack</h3>
      <ul>
        <li><strong>Frontend:</strong> Next.js, React, Tailwind CSS, Framer Motion</li>
        <li><strong>State Management:</strong> Zustand</li>
        <li><strong>Backend:</strong> Next.js API Routes (Node.js)</li>
        <li><strong>Database:</strong> PostgreSQL (or any DB of your choice)</li>
        <li><strong>Authentication:</strong> JWT / NextAuth.js</li>
      </ul>
      
      <h3>Achievements</h3>
      <ul>
        <li>🎯 Fully responsive design across all devices</li>
        <li>🚀 Fast loading with Next.js App Router</li>
        <li>🛒 Seamless cart experience with Zustand</li>
        <li>🎨 Beautiful UI inspired by Flipkart</li>
      </ul>
      
      <p>We're constantly improving – stay tuned for more features!</p>
    `
  },
  'press': {
    title: 'Press',
    content: `
      <h2>Press & Media</h2>
      <p>Welcome to the Flipkart Clone Press Center. Here you'll find our latest press releases, media coverage, and company news.</p>
      
      <h3>Latest Press Releases</h3>
      <ul>
        <li><strong>January 2025:</strong> Flipkart Clone launches new mobile app with enhanced features</li>
        <li><strong>December 2024:</strong> Company achieves 1 million users milestone</li>
        <li><strong>November 2024:</strong> Flipkart Clone raises $10M in Series A funding</li>
        <li><strong>October 2024:</strong> Expansion into 50 new cities across India</li>
      </ul>
      
      <h3>Media Kit</h3>
      <p>Download our logo, brand assets, and other resources:</p>
      <ul>
        <li><a href="#">Company Logo (PNG)</a></li>
        <li><a href="#">Press Kit (ZIP)</a></li>
        <li><a href="#">Fact Sheet (PDF)</a></li>
      </ul>
      
      <h3>Media Contact</h3>
      <p><strong>Email:</strong> press@flipkartclone.com</p>
      <p><strong>Phone:</strong> +91-9876543210</p>
    `
  },
  'corporate-information': {
    title: 'Corporate Information',
    content: `
      <h2>Corporate Information</h2>
      <p>Detailed information about Flipkart Clone's corporate structure, governance, and policies.</p>
      
      <h3>Company Profile</h3>
      <p><strong>Company Name:</strong> Flipkart Clone Private Limited</p>
      <p><strong>Registered Office:</strong> Building Alyssa, Begonia &amp; Clove Embassy Tech Village, Bengaluru, 560103</p>
      <p><strong>Incorporation Date:</strong> January 1, 2024</p>
      <p><strong>CIN:</strong> U72300KA2024PTCXXXXXX</p>
      <p><strong>GSTIN:</strong> 29XXXXXXXXXX</p>
      
      <h3>Board of Directors</h3>
      <ul>
        <li><strong>Mr. Rajesh Kumar</strong> – Chairman &amp; CEO</li>
        <li><strong>Ms. Priya Sharma</strong> – Chief Operating Officer</li>
        <li><strong>Mr. Amit Patel</strong> – Chief Technology Officer</li>
        <li><strong>Ms. Sneha Reddy</strong> – Chief Marketing Officer</li>
        <li><strong>Mr. Vikram Singh</strong> – Chief Financial Officer</li>
      </ul>
      
      <h3>Investor Relations</h3>
      <p>For investor inquiries, please contact <strong>investors@flipkartclone.com</strong></p>
      
      <h3>Statutory Documents</h3>
      <ul>
        <li><a href="#">Annual Report 2024</a></li>
        <li><a href="#">Code of Conduct</a></li>
        <li><a href="#">Corporate Governance Policy</a></li>
      </ul>
    `
  }
};

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const about = aboutContent[slug];

  if (!about) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-4">
          {about.title}
        </h1>
        <div
          className="prose prose-sm sm:prose-base max-w-none text-[#212121]"
          dangerouslySetInnerHTML={{ __html: about.content }}
        />
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/" className="text-[#2874f0] hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}