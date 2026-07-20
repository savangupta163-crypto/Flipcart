import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const policyContent: Record<string, { title: string; content: string }> = {
  'return-policy': {
    title: 'Return Policy',
    content: `
      <h2>Return Policy</h2>
      <p>We want you to be completely satisfied with your purchase. If you are not happy with your order, you may return it within 30 days of delivery for a full refund.</p>
      <h3>Conditions</h3>
      <ul>
        <li>Items must be unused and in the original packaging.</li>
        <li>Proof of purchase is required.</li>
        <li>Return shipping costs are the responsibility of the customer unless the item is defective.</li>
      </ul>
      <h3>How to Return</h3>
      <p>Contact our support team at support@flipkartclone.com to initiate a return.</p>
    `
  },
  'terms-of-use': {
    title: 'Terms of Use',
    content: `
      <h2>Terms of Use</h2>
      <p>By using this website, you agree to comply with and be bound by the following terms and conditions.</p>
      <h3>Acceptance of Terms</h3>
      <p>Your access to and use of the Site is conditioned on your acceptance of these Terms.</p>
      <h3>Modifications</h3>
      <p>We reserve the right to update these Terms at any time without prior notice.</p>
      <h3>Governing Law</h3>
      <p>These Terms shall be governed by the laws of India.</p>
    `
  },
  'security': {
    title: 'Security',
    content: `
      <h2>Security</h2>
      <p>We take the security of your personal information seriously. We implement a variety of security measures to maintain the safety of your personal information.</p>
      <h3>Encryption</h3>
      <p>All sensitive information is transmitted via Secure Socket Layer (SSL) technology.</p>
      <h3>Data Protection</h3>
      <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
    `
  },
  'privacy': {
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy</h2>
      <p>This Privacy Policy describes how we collect, use, and protect your personal information.</p>
      <h3>Information Collection</h3>
      <p>We collect information you provide directly, such as when you create an account, make a purchase, or contact us.</p>
      <h3>Use of Information</h3>
      <p>We use your information to process transactions, send order updates, and improve our services.</p>
      <h3>Cookies</h3>
      <p>We use cookies to enhance your browsing experience and analyze site traffic.</p>
    `
  },
  'sitemap': {
    title: 'Sitemap',
    content: `
      <h2>Sitemap</h2>
      <p>Here you can find an overview of all pages on our website:</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/categories">Categories</a></li>
        <li><a href="/deals">Deals of the Day</a></li>
        <li><a href="/cart">Cart</a></li>
        <li><a href="/account">My Account</a></li>
      </ul>
    `
  },
  'grievance-redressal': {
    title: 'Grievance Redressal',
    content: `
      <h2>Grievance Redressal</h2>
      <p>If you have any complaints or grievances regarding our products or services, please contact our Grievance Officer.</p>
      <h3>Contact Details</h3>
      <p><strong>Name:</strong> Mr. Rajesh Kumar</p>
      <p><strong>Email:</strong> grievance@flipkartclone.com</p>
      <p><strong>Phone:</strong> +91-9876543210</p>
      <p><strong>Timings:</strong> Mon-Fri, 10:00 AM – 6:00 PM (IST)</p>
      <p>We aim to resolve all grievances within 48 hours.</p>
    `
  }
};

// ✅ Make it async and await params
export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policyContent[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-4">
          {policy.title}
        </h1>
        <div
          className="prose prose-sm sm:prose-base max-w-none text-[#212121]"
          dangerouslySetInnerHTML={{ __html: policy.content }}
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