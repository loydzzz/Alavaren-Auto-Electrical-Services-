
import React from 'react';
import {
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaExclamationTriangle,
  FaFileContract,
  FaPrint,
  FaPhoneAlt,
  FaAward,
} from 'react-icons/fa';

const WarrantyCertificate = () => {

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* =====================================================
          WARRANTY CERTIFICATE
      ===================================================== */}

      <div className="warranty-page">

        {/* Print Button - Hidden When Printing */}
        <div className="warranty-actions">
          <button
            type="button"
            onClick={handlePrint}
            className="warranty-print-button"
          >
            <FaPrint />
            Print / Save as PDF
          </button>
        </div>


        {/* =====================================================
            MAIN PAPER
        ===================================================== */}

        <main className="warranty-paper">

          {/* Decorative Top Line */}
          <div className="warranty-top-line" />


          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="warranty-header">

            <div className="warranty-brand">

              {/* Professional Printable Logo */}
              <div className="warranty-logo">
                <FaShieldAlt />
              </div>

              <div>
                <div className="warranty-company">
                  ALAVAREN
                </div>

                <div className="warranty-company-subtitle">
                  AUTO ELECTRICAL SERVICES
                </div>
              </div>

            </div>


            <div className="warranty-document-label">
              <span>OFFICIAL SERVICE DOCUMENT</span>
              <strong>WARRANTY POLICY</strong>
            </div>

          </header>


          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="warranty-hero">

            <div className="warranty-shield">
              <FaShieldAlt />
            </div>

            <div className="warranty-hero-content">

              <div className="warranty-eyebrow">
                SERVICE ASSURANCE
              </div>

              <h1>
                1-Week Service Warranty
              </h1>

              <p>
                Our commitment to dependable automotive electrical
                service and customer satisfaction.
              </p>

            </div>

            <div className="warranty-number">
              <strong>7</strong>
              <span>DAYS</span>
            </div>

          </section>


          {/* =====================================================
              WARRANTY HIGHLIGHTS
          ===================================================== */}

          <section className="warranty-highlights">

            <div className="warranty-highlight">

              <div className="highlight-icon">
                <FaClock />
              </div>

              <div>
                <span className="highlight-label">
                  RESPONSE COMMITMENT
                </span>

                <strong>
                  Within 3 Days
                </strong>

                <p>
                  Reported vehicle concerns are responded to
                  within three (3) days.
                </p>
              </div>

            </div>


            <div className="warranty-divider" />


            <div className="warranty-highlight">

              <div className="highlight-icon">
                <FaAward />
              </div>

              <div>
                <span className="highlight-label">
                  SERVICE WARRANTY
                </span>

                <strong>
                  1 Week / 7 Days
                </strong>

                <p>
                  Eligible completed services are covered for
                  seven (7) calendar days.
                </p>
              </div>

            </div>

          </section>


          {/* =====================================================
              INTRODUCTION
          ===================================================== */}

          <section className="warranty-section">

            <div className="section-heading">

              <div className="section-heading-icon">
                <FaFileContract />
              </div>

              <div>
                <span>
                  WARRANTY AGREEMENT
                </span>

                <h2>
                  Our Service Commitment
                </h2>
              </div>

            </div>


            <p className="warranty-introduction">
              At <strong>Alavaren Auto Electrical Services</strong>,
              we stand behind the quality of eligible automotive
              electrical services performed by our team. This warranty
              policy is provided to give our customers additional
              assurance after a completed service or repair.
            </p>

            <p className="warranty-introduction">
              If the same or a related issue addressed during the
              original service occurs within the applicable warranty
              period, the customer may contact us so that the concern
              can be assessed and the appropriate service can be
              determined.
            </p>

          </section>


          {/* =====================================================
              WHAT IS COVERED
          ===================================================== */}

          <section className="warranty-section">

            <div className="section-heading">

              <div className="section-heading-icon green">
                <FaCheckCircle />
              </div>

              <div>
                <span>
                  COVERAGE
                </span>

                <h2>
                  What the Warranty Covers
                </h2>
              </div>

            </div>


            <div className="warranty-list">

              <div className="warranty-list-item">
                <FaCheckCircle />

                <div>
                  <strong>
                    Related Service Issue
                  </strong>

                  <p>
                    Covers the same or directly related issue
                    addressed during the completed service.
                  </p>
                </div>
              </div>


              <div className="warranty-list-item">
                <FaCheckCircle />

                <div>
                  <strong>
                    Service-Related Concerns
                  </strong>

                  <p>
                    Concerns reasonably determined to be connected
                    to the original service may be inspected.
                  </p>
                </div>
              </div>


              <div className="warranty-list-item">
                <FaCheckCircle />

                <div>
                  <strong>
                    Service Assessment
                  </strong>

                  <p>
                    Reported warranty concerns will be assessed
                    before any warranty work is performed.
                  </p>
                </div>
              </div>


              <div className="warranty-list-item">
                <FaCheckCircle />

                <div>
                  <strong>
                    Customer Support
                  </strong>

                  <p>
                    Customers may contact Alavaren Auto Electrical
                    Services when a covered concern occurs.
                  </p>
                </div>
              </div>

            </div>

          </section>


          {/* =====================================================
              WARRANTY PERIOD
          ===================================================== */}

          <section className="warranty-period">

            <div className="period-icon">
              <FaClock />
            </div>

            <div className="period-content">

              <span>
                WARRANTY PERIOD
              </span>

              <h2>
                Seven (7) Calendar Days
              </h2>

              <p>
                The warranty begins upon completion of the eligible
                service or repair and applies only to the specific
                service-related concern covered under this policy.
              </p>

            </div>

          </section>


          {/* =====================================================
              EXCLUSIONS
          ===================================================== */}

          <section className="warranty-section">

            <div className="section-heading">

              <div className="section-heading-icon orange">
                <FaExclamationTriangle />
              </div>

              <div>
                <span>
                  IMPORTANT
                </span>

                <h2>
                  Warranty Limitations & Exclusions
                </h2>
              </div>

            </div>


            <div className="warranty-exclusions">

              <p>
                This warranty applies only to the service or repair
                performed by Alavaren Auto Electrical Services and
                does not constitute a general warranty for the entire
                vehicle.
              </p>

              <ul>

                <li>
                  Issues unrelated to the original service or repair
                  are not covered.
                </li>

                <li>
                  Damage caused by accidents, collision, flooding,
                  fire, misuse, abuse, or external causes is not
                  covered.
                </li>

                <li>
                  Problems resulting from unauthorized modifications
                  or repairs by another person or service provider
                  may not be covered.
                </li>

                <li>
                  Normal wear and tear or failure of unrelated vehicle
                  components is not covered.
                </li>

                <li>
                  Replacement parts may be subject to the applicable
                  manufacturer's or supplier's warranty terms.
                </li>

                <li>
                  Warranty coverage is subject to inspection and
                  confirmation that the reported concern is related
                  to the original service.
                </li>

              </ul>

            </div>

          </section>


          {/* =====================================================
              RESPONSE POLICY
          ===================================================== */}

          <section className="response-policy">

            <div className="response-icon">
              <FaPhoneAlt />
            </div>

            <div>

              <span>
                CUSTOMER RESPONSE COMMITMENT
              </span>

              <h2>
                Report Your Concern Within 3 Days
              </h2>

              <p>
                Customers are encouraged to contact Alavaren Auto
                Electrical Services as soon as a related concern
                appears. We aim to respond to warranty-related
                concerns within three (3) days.
              </p>

            </div>

          </section>


          {/* =====================================================
              CUSTOMER ACKNOWLEDGMENT
          ===================================================== */}

          <section className="acknowledgment">

            <div className="acknowledgment-icon">
              <FaTools />
            </div>

            <div>

              <h2>
                Service Warranty Acknowledgment
              </h2>

              <p>
                By accepting a completed service from Alavaren Auto
                Electrical Services, the customer acknowledges that
                this warranty applies to eligible service-related
                concerns as described above and is subject to the
                terms and limitations of this policy.
              </p>

            </div>

          </section>


          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer className="warranty-footer">

            <div>
              <strong>
                ALAVAREN AUTO ELECTRICAL SERVICES
              </strong>

              <span>
                Professional Automotive Electrical Service
              </span>
            </div>


            <div className="footer-warranty-badge">
              <FaShieldAlt />

              <span>
                1-WEEK SERVICE WARRANTY
              </span>
            </div>

          </footer>


          <div className="warranty-bottom-line" />

        </main>
      </div>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        .warranty-page {
          min-height: 100vh;

          background:
            linear-gradient(
              135deg,
              #eef1f4 0%,
              #f8f9fa 50%,
              #e9ecef 100%
            );

          padding: 40px 20px;

          color: #252525;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }


        /* =====================================================
           PRINT BUTTON
        ===================================================== */

        .warranty-actions {
          max-width: 900px;
          margin: 0 auto 20px;

          display: flex;
          justify-content: flex-end;
        }


        .warranty-print-button {
          border: none;

          background: #c0392b;
          color: white;

          padding: 12px 20px;

          border-radius: 8px;

          display: flex;
          align-items: center;

          gap: 9px;

          font-weight: 700;
          font-size: 14px;

          cursor: pointer;

          box-shadow:
            0 6px 18px rgba(192, 57, 43, .22);

          transition: .2s ease;
        }


        .warranty-print-button:hover {
          background: #a93226;
          transform: translateY(-1px);
        }


        /* =====================================================
           PAPER
        ===================================================== */

        .warranty-paper {
          width: 100%;
          max-width: 900px;

          margin: 0 auto;

          background: #ffffff;

          position: relative;
          overflow: hidden;

          box-shadow:
            0 25px 70px rgba(0, 0, 0, .13);

          border-radius: 4px;
        }


        .warranty-top-line {
          height: 7px;

          background:
            linear-gradient(
              90deg,
              #9d2f24,
              #c0392b,
              #e1b12c,
              #c0392b,
              #9d2f24
            );
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .warranty-header {
          padding: 34px 48px 28px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 30px;

          border-bottom: 1px solid #e6e6e6;
        }


        .warranty-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }


        /* Professional Shield Logo */
        .warranty-logo {
          width: 58px;
          height: 58px;

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              #c0392b,
              #8f281e
            );

          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 27px;

          box-shadow:
            0 8px 18px rgba(192, 57, 43, .22);
        }


        .warranty-company {
          font-size: 25px;
          font-weight: 900;

          letter-spacing: 1.8px;

          color: #202020;
        }


        .warranty-company-subtitle {
          font-size: 11px;
          font-weight: 800;

          letter-spacing: 2.2px;

          color: #c0392b;

          margin-top: 3px;
        }


        .warranty-document-label {
          text-align: right;
        }


        .warranty-document-label span {
          display: block;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1.8px;

          color: #999;

          margin-bottom: 4px;
        }


        .warranty-document-label strong {
          font-size: 14px;

          letter-spacing: 1.2px;

          color: #333;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .warranty-hero {
          margin: 30px 48px;

          padding: 28px 30px;

          border-radius: 14px;

          background:
            linear-gradient(
              120deg,
              #241f1e,
              #352927
            );

          color: #fff;

          display: flex;
          align-items: center;

          gap: 22px;

          position: relative;
          overflow: hidden;
        }


        .warranty-hero::after {
          content: "";

          position: absolute;

          width: 240px;
          height: 240px;

          border: 1px solid rgba(255,255,255,.08);

          border-radius: 50%;

          right: -70px;
          top: -100px;
        }


        .warranty-shield {
          width: 62px;
          height: 62px;

          min-width: 62px;

          border-radius: 50%;

          background: #c0392b;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 27px;

          box-shadow:
            0 7px 20px rgba(0,0,0,.25);

          z-index: 1;
        }


        .warranty-hero-content {
          flex: 1;
          z-index: 1;
        }


        .warranty-eyebrow {
          color: #e1b12c;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;

          margin-bottom: 5px;
        }


        .warranty-hero h1 {
          margin: 0;

          font-size: 29px;
          line-height: 1.15;

          font-weight: 900;
        }


        .warranty-hero p {
          margin: 8px 0 0;

          color: #d8d2d0;

          font-size: 13px;

          line-height: 1.6;

          max-width: 530px;
        }


        .warranty-number {
          z-index: 1;

          text-align: center;

          min-width: 75px;
        }


        .warranty-number strong {
          display: block;

          color: #e1b12c;

          font-size: 48px;

          line-height: .9;

          font-weight: 900;
        }


        .warranty-number span {
          display: block;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: 2px;

          color: #fff;

          margin-top: 5px;
        }


        /* =====================================================
           HIGHLIGHTS
        ===================================================== */

        .warranty-highlights {
          margin: 0 48px;

          padding: 20px 0;

          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          border-bottom: 1px solid #e8e8e8;
        }


        .warranty-highlight {
          display: flex;
          align-items: center;

          gap: 14px;

          padding: 8px 20px;
        }


        .highlight-icon {
          width: 43px;
          height: 43px;

          min-width: 43px;

          border-radius: 10px;

          background: #fff4f2;

          color: #c0392b;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 18px;
        }


        .highlight-label {
          display: block;

          color: #999;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.3px;

          margin-bottom: 3px;
        }


        .warranty-highlight strong {
          display: block;

          color: #282828;

          font-size: 16px;
        }


        .warranty-highlight p {
          margin: 3px 0 0;

          font-size: 10px;

          color: #777;

          line-height: 1.45;
        }


        .warranty-divider {
          width: 1px;
          height: 58px;

          background: #e1e1e1;
        }


        /* =====================================================
           GENERAL SECTIONS
        ===================================================== */

        .warranty-section {
          margin: 30px 48px;
        }


        .section-heading {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-bottom: 15px;
        }


        .section-heading-icon {
          width: 37px;
          height: 37px;

          border-radius: 9px;

          background: #fff4f2;

          color: #c0392b;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 15px;
        }


        .section-heading-icon.green {
          color: #238b57;
          background: #eefaf3;
        }


        .section-heading-icon.orange {
          color: #c26a18;
          background: #fff6e9;
        }


        .section-heading span {
          display: block;

          font-size: 8px;

          color: #999;

          font-weight: 900;

          letter-spacing: 1.5px;
        }


        .section-heading h2 {
          margin: 2px 0 0;

          font-size: 18px;

          color: #282828;

          font-weight: 850;
        }


        .warranty-introduction {
          font-size: 12px;

          line-height: 1.75;

          color: #5d5d5d;

          margin: 7px 0;
        }


        .warranty-introduction strong {
          color: #303030;
        }


        /* =====================================================
           COVERAGE LIST
        ===================================================== */

        .warranty-list {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 10px;
        }


        .warranty-list-item {
          display: flex;

          gap: 11px;

          padding: 14px;

          border: 1px solid #ececec;

          border-radius: 9px;

          background: #fcfcfc;
        }


        .warranty-list-item > svg {
          color: #26965c;

          margin-top: 2px;

          min-width: 15px;
        }


        .warranty-list-item strong {
          display: block;

          font-size: 12px;

          color: #333;

          margin-bottom: 3px;
        }


        .warranty-list-item p {
          margin: 0;

          font-size: 10px;

          color: #777;

          line-height: 1.55;
        }


        /* =====================================================
           WARRANTY PERIOD
        ===================================================== */

        .warranty-period {
          margin: 30px 48px;

          padding: 20px 22px;

          display: flex;

          gap: 15px;

          align-items: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #fff8e5,
              #fffdf6
            );

          border: 1px solid #f0dfaa;
        }


        .period-icon {
          width: 46px;
          height: 46px;

          min-width: 46px;

          border-radius: 50%;

          background: #e1b12c;

          color: #fff;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 19px;
        }


        .period-content span {
          display: block;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: 1.5px;

          color: #9b7c18;
        }


        .period-content h2 {
          margin: 3px 0;

          font-size: 17px;

          color: #493d1a;
        }


        .period-content p {
          margin: 0;

          font-size: 10px;

          color: #746a4a;

          line-height: 1.55;
        }


        /* =====================================================
           EXCLUSIONS
        ===================================================== */

        .warranty-exclusions {
          border-left: 3px solid #e1b12c;

          padding: 2px 0 2px 17px;
        }


        .warranty-exclusions > p {
          margin: 0 0 10px;

          color: #555;

          font-size: 11px;

          line-height: 1.65;
        }


        .warranty-exclusions ul {
          margin: 0;

          padding-left: 18px;

          color: #666;
        }


        .warranty-exclusions li {
          font-size: 10px;

          line-height: 1.65;

          padding-left: 3px;

          margin-bottom: 2px;
        }


        /* =====================================================
           RESPONSE POLICY
        ===================================================== */

        .response-policy {
          margin: 30px 48px;

          padding: 20px 22px;

          border-radius: 10px;

          background: #f7f8f9;

          border: 1px solid #e4e6e8;

          display: flex;

          gap: 15px;

          align-items: flex-start;
        }


        .response-icon {
          width: 43px;
          height: 43px;

          min-width: 43px;

          border-radius: 9px;

          background: #252525;

          color: #e1b12c;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 16px;
        }


        .response-policy span {
          display: block;

          color: #999;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;
        }


        .response-policy h2 {
          margin: 3px 0 5px;

          font-size: 16px;

          color: #282828;
        }


        .response-policy p {
          margin: 0;

          color: #666;

          font-size: 10px;

          line-height: 1.6;
        }


        /* =====================================================
           ACKNOWLEDGMENT
        ===================================================== */

        .acknowledgment {
          margin: 30px 48px 25px;

          padding: 17px 19px;

          border-radius: 9px;

          background: #fffafa;

          border: 1px solid #f0dddd;

          display: flex;

          gap: 13px;
        }


        .acknowledgment-icon {
          color: #c0392b;

          font-size: 17px;

          padding-top: 2px;
        }


        .acknowledgment h2 {
          margin: 0 0 5px;

          font-size: 13px;

          color: #333;
        }


        .acknowledgment p {
          margin: 0;

          font-size: 9.5px;

          line-height: 1.6;

          color: #6a6a6a;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .warranty-footer {
          margin: 0 48px;

          padding: 20px 0;

          border-top: 1px solid #e5e5e5;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }


        .warranty-footer strong {
          display: block;

          font-size: 10px;

          letter-spacing: 1px;

          color: #333;
        }


        .warranty-footer span {
          display: block;

          font-size: 8px;

          color: #999;

          margin-top: 4px;
        }


        .footer-warranty-badge {
          display: flex;

          align-items: center;

          gap: 7px;

          color: #c0392b;

          font-size: 8px !important;

          font-weight: 900;

          letter-spacing: 1px;

          white-space: nowrap;
        }


        .footer-warranty-badge span {
          color: #c0392b;

          font-size: 8px;

          font-weight: 900;

          margin: 0;
        }


        .warranty-bottom-line {
          height: 4px;

          background: #252525;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 700px) {

          .warranty-page {
            padding: 15px 8px;
          }


          .warranty-header {
            padding: 25px;

            flex-direction: column;

            align-items: flex-start;
          }


          .warranty-document-label {
            text-align: left;
          }


          .warranty-hero {
            margin: 20px 25px;

            padding: 22px;
          }


          .warranty-hero h1 {
            font-size: 22px;
          }


          .warranty-number {
            display: none;
          }


          .warranty-highlights {
            margin: 0 25px;

            display: block;
          }


          .warranty-divider {
            width: 100%;

            height: 1px;

            margin: 8px 0;
          }


          .warranty-highlight {
            padding: 10px 0;
          }


          .warranty-section,
          .warranty-period,
          .response-policy,
          .acknowledgment {
            margin-left: 25px;
            margin-right: 25px;
          }


          .warranty-list {
            grid-template-columns: 1fr;
          }


          .warranty-footer {
            margin-left: 25px;
            margin-right: 25px;

            flex-direction: column;

            align-items: flex-start;
          }

        }


        /* =====================================================
           PRINT STYLES
        ===================================================== */

        @media print {

          @page {
            size: A4;
            margin: 8mm;
          }


          html,
          body {
            margin: 0 !important;
            padding: 0 !important;

            background: #fff !important;
          }


          .warranty-page {
            padding: 0 !important;
            margin: 0 !important;

            background: #fff !important;

            min-height: auto !important;
          }


          .warranty-actions {
            display: none !important;
          }


          .warranty-paper {
            max-width: none !important;
            width: 100% !important;

            box-shadow: none !important;

            border-radius: 0 !important;
          }


          .warranty-top-line,
          .warranty-bottom-line,
          .warranty-logo,
          .warranty-shield,
          .period-icon,
          .response-icon {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }


          .warranty-hero,
          .warranty-period,
          .response-policy,
          .acknowledgment,
          .warranty-list-item,
          .highlight-icon,
          .section-heading-icon {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }


          .warranty-section,
          .warranty-period,
          .response-policy,
          .acknowledgment {
            break-inside: avoid;
            page-break-inside: avoid;
          }


          .warranty-header {
            break-inside: avoid;
          }

        }

      `}</style>
    </>
  );
};

export default WarrantyCertificate;
