import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  FileText,
} from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-[#1A302B10] flex items-center justify-center">
        <Icon size={16} className="text-[#1A302B]" />
      </div>
      <h2 className="text-base font-bold text-[#1A302B]">{title}</h2>
    </div>
    <div className="text-sm text-gray-500 leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const Terms = () => (
  <div className="bg-[#F9F9F9] min-h-screen pt-24 sm:pt-28 pb-16">
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors mb-8"
      >
        <ChevronLeft size={13} /> Back
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={22} className="text-[#C28E77]" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
            Terms & Conditions
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-4">
        <Section icon={ShieldCheck} title="1. Use of Service">
          <p>
            By accessing EcoCart, you agree to use our platform solely for
            lawful purposes. You must not misuse our services, attempt
            unauthorized access, or disrupt our operations in any way.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your
            account.
          </p>
        </Section>

        <Section icon={Truck} title="2. Orders & Delivery">
          <p>
            All orders are subject to product availability. We process orders
            within 24 hours of placement. Delivery timelines may vary based on
            your location and product availability.
          </p>
          <p>
            Free delivery is applicable on all orders. We are not liable for
            delays caused by circumstances beyond our control, including natural
            events or logistics disruptions.
          </p>
        </Section>

        <Section icon={RotateCcw} title="3. Returns & Refunds">
          <p>
            You may cancel an order within 5 minutes of placing it. After this
            window, cancellations are at our discretion. Refunds for eligible
            cancellations are processed within 7 business days.
          </p>
          <p>
            For damaged or incorrect products, please contact our support team
            within 48 hours of delivery with supporting images.
          </p>
        </Section>

        <Section icon={Lock} title="4. Privacy & Data">
          <p>
            We collect only the information necessary to fulfil your orders and
            improve your experience. Your data is never sold to third parties.
          </p>
          <p>
            We use industry-standard encryption to protect your personal and
            payment information. By using EcoCart, you consent to our data
            practices as described in this policy.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="5. Product Quality">
          <p>
            All products listed on EcoCart are certified organic and sourced
            from verified suppliers. We maintain strict quality standards and
            regularly audit our supply chain.
          </p>
          <p>
            Product images are representative. Actual appearance may vary
            slightly due to natural variations in organic produce.
          </p>
        </Section>

        <Section icon={FileText} title="6. Intellectual Property">
          <p>
            All content on EcoCart — including logos, product images, and text —
            is the property of EcoCart and protected by applicable intellectual
            property laws.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works from
            our content without explicit written permission.
          </p>
        </Section>

        <div className="bg-[#1A302B] rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-white/60 text-sm mb-1">
            Questions about our terms?
          </p>
          <p className="text-white font-semibold text-sm">support@ecocart.in</p>
          <p className="text-[#C28E77] text-[11px] font-bold uppercase tracking-widest mt-4">
            © {new Date().getFullYear()} EcoCart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;
