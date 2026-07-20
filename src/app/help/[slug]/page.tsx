import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const helpContent: Record<string, { title: string; content: string }> = {
  'payments': {
    title: 'Payments',
    content: `
      <h2>Payments</h2>
      <p>We offer a variety of secure payment options for your convenience:</p>
      <ul>
        <li><strong>Credit / Debit Cards</strong> – Visa, Mastercard, RuPay, American Express</li>
        <li><strong>Net Banking</strong> – All major banks supported</li>
        <li><strong>UPI</strong> – Google Pay, PhonePe, Paytm, Amazon Pay</li>
        <li><strong>Wallet</strong> – Flipkart Wallet, Paytm Wallet</li>
        <li><strong>Cash on Delivery (COD)</strong> – Pay when you receive the order</li>
      </ul>
      <p>Your payment information is encrypted and secure. We never store your card details.</p>
    `
  },
  'shipping': {
    title: 'Shipping',
    content: `
      <h2>Shipping</h2>
      <p>We ship across India with multiple delivery partners.</p>
      <ul>
        <li><strong>Standard Delivery</strong> – 3-5 business days</li>
        <li><strong>Express Delivery</strong> – 1-2 business days (available in select cities)</li>
        <li><strong>Same Day Delivery</strong> – Available in metro cities for eligible products</li>
      </ul>
      <p>Shipping is free on orders above ₹499. A flat fee of ₹49 applies for orders below that.</p>
      <p>You will receive a tracking number via email and SMS once your order ships.</p>
    `
  },
  'cancellation-returns': {
    title: 'Cancellation & Returns',
    content: `
      <h2>Cancellation & Returns</h2>
      <h3>Cancellation</h3>
      <p>You can cancel your order before it ships. Go to "My Orders" and click "Cancel".</p>
      <p>If the order has already shipped, you can refuse delivery or initiate a return.</p>
      
      <h3>Returns</h3>
      <p>We offer a <strong>7-day return policy</strong> on most products. Items must be unused and in original packaging.</p>
      <p>To initiate a return, go to "My Orders", select the item, and click "Return".</p>
      <p>Return shipping is free for defective or wrong items. For other cases, a small fee may apply.</p>
      <p>Refunds are processed within 5-7 business days after we receive the returned item.</p>
    `
  },
  'faq': {
    title: 'Frequently Asked Questions',
    content: `
      <h2>Frequently Asked Questions</h2>
      
      <h3>How do I place an order?</h3>
      <p>Browse products, add to cart, and proceed to checkout. Enter your address and payment details to confirm.</p>
      
      <h3>How can I track my order?</h3>
      <p>Go to "My Orders" and click on the order number. You'll see real-time tracking information.</p>
      
      <h3>What if I receive a damaged product?</h3>
      <p>Please contact our support within 24 hours of delivery. We'll arrange a return and replacement.</p>
      
      <h3>Do you offer international shipping?</h3>
      <p>Currently, we only ship within India.</p>
      
      <h3>How do I change my delivery address?</h3>
      <p>You can update your address in the "My Account" section. For existing orders, contact support immediately.</p>
    `
  },
  'report-infringement': {
    title: 'Report Infringement',
    content: `
      <h2>Report Infringement</h2>
      <p>If you believe that your intellectual property rights have been violated, please submit a report.</p>
      
      <h3>How to Report</h3>
      <p>Send an email to <strong>legal@flipkartclone.com</strong> with the following details:</p>
      <ul>
        <li>Your contact information (name, phone, email)</li>
        <li>A description of the copyrighted work or trademark</li>
        <li>The URL(s) where the infringement appears</li>
        <li>A statement that you have a good faith belief that the use is unauthorized</li>
        <li>A physical or electronic signature</li>
      </ul>
      <p>We will investigate and take appropriate action within 48 hours.</p>
    `
  }
};

export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const help = helpContent[slug];

  if (!help) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] mb-4">
          {help.title}
        </h1>
        <div
          className="prose prose-sm sm:prose-base max-w-none text-[#212121]"
          dangerouslySetInnerHTML={{ __html: help.content }}
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