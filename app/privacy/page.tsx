import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { GradientLogo } from '../../src/components/common/GradientLogo';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <GradientLogo size="sm" />
            <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-invert max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: January 2025</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Personal Information</h3>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    When you create an account, we collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Email address and password</li>
                    <li>Display name and username</li>
                    <li>Date of birth and gender</li>
                    <li>Profile photo and cover photo (optional)</li>
                    <li>Bio and personal description</li>
                    <li>Social media profile links (optional)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Location Information</h3>
                  <p className="text-gray-300 leading-relaxed">
                    With your explicit consent, we collect your device's location to help you discover nearby users. You can enable or disable location sharing at any time. Location data is automatically cleared when you log out or after 5 minutes of inactivity.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Usage Information</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We automatically collect information about how you use our Service, including posts you create, messages you send, and interactions with other users.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Connect you with nearby users (when location is enabled)</li>
                <li>Enable messaging and social features</li>
                <li>Verify your social media accounts</li>
                <li>Improve and personalize your experience</li>
                <li>Ensure safety and security of the platform</li>
                <li>Communicate with you about the Service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">With Other Users</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Your profile information (name, photo, bio, verified social accounts) is visible to other users. Your exact location is never shared - only general proximity to help users discover each other.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-2">With Third Parties</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 mt-2">
                    <li>With your explicit consent</li>
                    <li>To comply with legal requirements</li>
                    <li>To protect our rights and safety</li>
                    <li>In connection with a business transfer</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Location Privacy</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Location sharing is entirely optional and under your control:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>You must explicitly enable location sharing</li>
                <li>Your exact coordinates are never shared with other users</li>
                <li>Only general proximity (within the same area) is used for discovery</li>
                <li>Location data is automatically cleared after 5 minutes of inactivity</li>
                <li>All location data is deleted when you log out</li>
                <li>You can disable location sharing at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide the Service. You may delete your account at any time, which will remove your personal information from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Control your privacy settings</li>
                <li>Opt out of location sharing</li>
                <li>Request a copy of your data</li>
                <li>Report privacy concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Zenlit is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. International Users</h2>
              <p className="text-gray-300 leading-relaxed">
                If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-white">Email: privacy@zenlit.com</p>
                <p className="text-white">Support: support@zenlit.com</p>
                <p className="text-gray-400 text-sm mt-2">
                  We are committed to resolving privacy concerns promptly
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Zenlit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}