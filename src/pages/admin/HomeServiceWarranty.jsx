import React from 'react'
import {
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaExclamationTriangle,
  FaFileContract,
  FaPrint,
  FaPhoneAlt,
  FaHome,
  FaMapMarkerAlt,
} from 'react-icons/fa'

const HomeServiceWarrantyCertificate = () => {

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* =====================================================
          HOME SERVICE WARRANTY CERTIFICATE
      ===================================================== */}

      <div className="home-warranty-page">

        {/* =====================================================
            PRINT BUTTON
        ===================================================== */}

        <div className="home-warranty-actions">

          <button
            type="button"
            onClick={handlePrint}
            className="home-warranty-print-button"
          >
            <FaPrint />
            Print / Save as PDF
          </button>

        </div>


        {/* =====================================================
            MAIN PAPER
        ===================================================== */}

        <main className="home-warranty-paper">

          {/* TOP DECORATIVE LINE */}

          <div className="home-warranty-top-line" />


          {/* =====================================================
              HEADER
          ===================================================== */}

          <header className="home-warranty-header">

            <div className="home-warranty-brand">

              <div className="home-warranty-logo">
                <FaShieldAlt />
              </div>

              <div>

                <div className="home-warranty-company">
                  ALAVAREN
                </div>

                <div className="home-warranty-company-subtitle">
                  AUTO ELECTRICAL SERVICES
                </div>

              </div>

            </div>


            <div className="home-warranty-document-label">

              <span>
                OFFICIAL SERVICE DOCUMENT
              </span>

              <strong>
                HOME SERVICE WARRANTY
              </strong>

            </div>

          </header>


          {/* =====================================================
              HERO
          ===================================================== */}

          <section className="home-warranty-hero">

            <div className="home-warranty-shield">
              <FaHome />
            </div>


            <div className="home-warranty-hero-content">

              <div className="home-warranty-eyebrow">
                HOME SERVICE ASSURANCE
              </div>

              <h1>
                1-Week Home Service Warranty
              </h1>

              <p>
                Service assurance for eligible automotive electrical
                services performed at the customer's location.
              </p>

            </div>


            <div className="home-warranty-number">

              <strong>
                7
              </strong>

              <span>
                DAYS
              </span>

            </div>

          </section>


          {/* =====================================================
              SERVICE HIGHLIGHTS
          ===================================================== */}

          <section className="home-warranty-highlights">

            <div className="home-warranty-highlight">

              <div className="home-highlight-icon">
                <FaHome />
              </div>

              <div>

                <span className="home-highlight-label">
                  SERVICE LOCATION
                </span>

                <strong>
                  Customer Location
                </strong>

                <p>
                  The original eligible service was performed
                  through Home Service at the customer's location.
                </p>

              </div>

            </div>


            <div className="home-warranty-divider" />


            <div className="home-warranty-highlight">

              <div className="home-highlight-icon">
                <FaClock />
              </div>

              <div>

                <span className="home-highlight-label">
                  WARRANTY PERIOD
                </span>

                <strong>
                  7 Calendar Days
                </strong>

                <p>
                  Coverage begins upon completion of the
                  eligible Home Service.
                </p>

              </div>

            </div>

          </section>


          {/* =====================================================
              INTRODUCTION
          ===================================================== */}

          <section className="home-warranty-section">

            <div className="home-section-heading">

              <div className="home-section-heading-icon">
                <FaFileContract />
              </div>

              <div>

                <span>
                  HOME SERVICE WARRANTY AGREEMENT
                </span>

                <h2>
                  Our Service Commitment
                </h2>

              </div>

            </div>


            <p className="home-warranty-introduction">

              At <strong>Alavaren Auto Electrical Services</strong>,
              we provide this Home Service Warranty to give our
              customers additional assurance after an eligible
              automotive electrical service has been completed at
              the customer's location.

            </p>


            <p className="home-warranty-introduction">

              This warranty applies only to the specific eligible
              service performed during the original Home Service
              appointment. It does not constitute a general warranty
              for the entire vehicle.

            </p>


            <p className="home-warranty-introduction">

              If the same or a directly related service concern
              occurs within the applicable warranty period, the
              customer may contact Alavaren Auto Electrical Services
              so the concern can be assessed and the appropriate
              next step can be determined.

            </p>

          </section>


          {/* =====================================================
              HOME SERVICE COVERAGE
          ===================================================== */}

          <section className="home-warranty-section">

            <div className="home-section-heading">

              <div className="home-section-heading-icon green">
                <FaCheckCircle />
              </div>

              <div>

                <span>
                  COVERAGE
                </span>

                <h2>
                  What the Home Service Warranty Covers
                </h2>

              </div>

            </div>


            <div className="home-warranty-list">

              {/* ITEM 1 */}

              <div className="home-warranty-list-item">

                <FaCheckCircle />

                <div>

                  <strong>
                    Original Home Service
                  </strong>

                  <p>
                    Coverage applies only to the eligible
                    automotive electrical service performed
                    during the original Home Service appointment.
                  </p>

                </div>

              </div>


              {/* ITEM 2 */}

              <div className="home-warranty-list-item">

                <FaCheckCircle />

                <div>

                  <strong>
                    Related Service Concern
                  </strong>

                  <p>
                    The same or directly related concern addressed
                    during the original service may be assessed
                    under the warranty.
                  </p>

                </div>

              </div>


              {/* ITEM 3 */}

              <div className="home-warranty-list-item">

                <FaCheckCircle />

                <div>

                  <strong>
                    Home Service Assessment
                  </strong>

                  <p>
                    When appropriate, the reported concern may be
                    assessed at the customer's location.
                  </p>

                </div>

              </div>


              {/* ITEM 4 */}

              <div className="home-warranty-list-item">

                <FaCheckCircle />

                <div>

                  <strong>
                    Shop Inspection When Required
                  </strong>

                  <p>
                    If proper diagnosis, inspection, equipment, or
                    repair cannot be completed through Home Service,
                    the vehicle may need to be brought to our shop.
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =====================================================
              HOME SERVICE PROCESS
          ===================================================== */}

          <section className="home-service-process">

            <div className="home-process-icon">
              <FaTools />
            </div>


            <div className="home-process-content">

              <span>
                WARRANTY ASSESSMENT PROCESS
              </span>

              <h2>
                Home Assessment or Shop Inspection
              </h2>

              <p>

                A warranty concern must first be assessed before
                warranty work is performed. Depending on the
                reported concern, vehicle condition, equipment
                requirements, and service needs, Alavaren Auto
                Electrical Services may conduct the assessment
                through Home Service or request that the vehicle
                be brought to our shop.

              </p>

            </div>

          </section>


          {/* =====================================================
              WARRANTY PERIOD
          ===================================================== */}

          <section className="home-warranty-period">

            <div className="home-period-icon">
              <FaClock />
            </div>


            <div className="home-period-content">

              <span>
                WARRANTY PERIOD
              </span>

              <h2>
                Seven (7) Calendar Days
              </h2>

              <p>

                The warranty begins upon completion of the eligible
                Home Service and applies only to the specific
                service-related concern covered by this policy.
                Customers should report any related concern as
                soon as it is noticed during the warranty period.

              </p>

            </div>

          </section>


          {/* =====================================================
              RESPONSE COMMITMENT
          ===================================================== */}

          <section className="home-response-commitment">

            <div className="home-response-commitment-icon">
              <FaClock />
            </div>


            <div className="home-response-commitment-content">

              <span>
                RESPONSE COMMITMENT
              </span>

              <h2>
                Immediate Contact / Response Within 3 Days
              </h2>

              <p>

                Customers are encouraged to contact Alavaren Auto
                Electrical Services immediately when a related
                warranty concern occurs. Our team will respond
                as soon as reasonably possible, with a response
                commitment within three (3) calendar days.

              </p>

              <p className="home-response-note">

                <strong>
                  Important:
                </strong>{' '}
                The three (3) calendar-day period refers to the
                response and coordination of the warranty concern.
                It does not reduce or replace the seven (7) calendar-day
                warranty period.

              </p>

            </div>

          </section>


          {/* =====================================================
              WARRANTY REFERENCE
          ===================================================== */}

          <section className="home-warranty-reference">

            <div className="home-reference-icon">
              <FaFileContract />
            </div>


            <div className="home-reference-content">

              <span>
                WARRANTY REFERENCE
              </span>

              <h2>
                Service Receipt or Transaction Record
              </h2>

              <p>

                This warranty covers the eligible Home Service
                performed by <strong>Alavaren Auto Electrical
                Services</strong>. Customers may use their official
                service receipt or transaction record as proof of
                the service performed.

              </p>

            </div>

          </section>


          {/* =====================================================
              IMPORTANT SERVICE LOCATION NOTICE
          ===================================================== */}

          <section className="home-location-notice">

            <div className="home-location-icon">
              <FaMapMarkerAlt />
            </div>


            <div>

              <span>
                IMPORTANT SERVICE LOCATION NOTICE
              </span>

              <h2>
                Home Service Does Not Guarantee Home Warranty Repair
              </h2>

              <p>

                A warranty concern may be assessed at the customer's
                location when the concern is suitable for Home
                Service. However, some electrical concerns may
                require additional equipment, testing, inspection,
                working conditions, or repair procedures that cannot
                be properly performed at the customer's location.

              </p>

              <p>

                In such cases, the customer may be requested to
                bring the vehicle to the Alavaren Auto Electrical
                Services shop for further inspection or service.

              </p>

            </div>

          </section>


          {/* =====================================================
              EXCLUSIONS
          ===================================================== */}

          <section className="home-warranty-section">

            <div className="home-section-heading">

              <div className="home-section-heading-icon orange">
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


            <div className="home-warranty-exclusions">

              <p>

                This warranty applies only to the eligible
                automotive electrical service performed by
                Alavaren Auto Electrical Services during the
                original Home Service appointment.

              </p>


              <ul>

                <li>
                  Issues unrelated to the original service or
                  repair are not covered.
                </li>

                <li>
                  Damage caused by accidents, collision, flooding,
                  fire, misuse, abuse, or other external causes
                  is not covered.
                </li>

                <li>
                  Problems caused by unauthorized modifications
                  or repairs performed by another person or
                  service provider may not be covered.
                </li>

                <li>
                  Normal wear and tear or failure of unrelated
                  vehicle components is not covered.
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

                <li>
                  The warranty does not guarantee that every
                  warranty inspection or repair can be performed
                  at the customer's location.
                </li>

              </ul>

            </div>

          </section>


          {/* =====================================================
              CUSTOMER RESPONSE
          ===================================================== */}

          <section className="home-response-policy">

            <div className="home-response-icon">
              <FaPhoneAlt />
            </div>


            <div>

              <span>
                CUSTOMER RESPONSE
              </span>

              <h2>
                Contact Us as Soon as a Related Concern Appears
              </h2>

              <p>

                Customers are encouraged to contact Alavaren Auto
                Electrical Services as soon as a related concern
                appears during the warranty period. The concern
                will be assessed before any warranty service is
                performed.

              </p>

            </div>

          </section>


          {/* =====================================================
              ACKNOWLEDGMENT
          ===================================================== */}

          <section className="home-acknowledgment">

            <div className="home-acknowledgment-icon">
              <FaTools />
            </div>


            <div>

              <h2>
                Home Service Warranty Acknowledgment
              </h2>

              <p>

                By accepting the completed Home Service, the
                customer acknowledges that this warranty applies
                only to eligible service-related concerns and is
                subject to the terms, limitations, inspection
                requirements, and service-location conditions
                described in this policy.

              </p>

            </div>

          </section>


          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer className="home-warranty-footer">

            <div>

              <strong>
                ALAVAREN AUTO ELECTRICAL SERVICES
              </strong>

              <span>
                Professional Automotive Electrical Service
              </span>

            </div>


            <div className="home-footer-badge">

              <FaShieldAlt />

              <span>
                1-WEEK HOME SERVICE WARRANTY
              </span>

            </div>

          </footer>


          {/* BOTTOM DECORATIVE LINE */}

          <div className="home-warranty-bottom-line" />

        </main>

      </div>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================================
           PAGE
        ===================================================== */

        .home-warranty-page {

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

        .home-warranty-actions {

          max-width: 900px;

          margin: 0 auto 20px;

          display: flex;

          justify-content: flex-end;

        }


        .home-warranty-print-button {

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


        .home-warranty-print-button:hover {

          background: #a93226;

          transform: translateY(-1px);

        }


        /* =====================================================
           PAPER
        ===================================================== */

        .home-warranty-paper {

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


        .home-warranty-top-line {

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

        .home-warranty-header {

          padding: 34px 48px 28px;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 30px;

          border-bottom: 1px solid #e6e6e6;

        }


        .home-warranty-brand {

          display: flex;

          align-items: center;

          gap: 16px;

        }


        .home-warranty-logo {

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


        .home-warranty-company {

          font-size: 25px;

          font-weight: 900;

          letter-spacing: 1.8px;

          color: #202020;

        }


        .home-warranty-company-subtitle {

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 2.2px;

          color: #c0392b;

          margin-top: 3px;

        }


        .home-warranty-document-label {

          text-align: right;

        }


        .home-warranty-document-label span {

          display: block;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.8px;

          color: #999;

          margin-bottom: 4px;

        }


        .home-warranty-document-label strong {

          font-size: 14px;

          letter-spacing: 1.2px;

          color: #333;

        }


        /* =====================================================
           HERO
        ===================================================== */

        .home-warranty-hero {

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


        .home-warranty-hero::after {

          content: "";

          position: absolute;

          width: 240px;

          height: 240px;

          border: 1px solid rgba(255,255,255,.08);

          border-radius: 50%;

          right: -70px;

          top: -100px;

        }


        .home-warranty-shield {

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


        .home-warranty-hero-content {

          flex: 1;

          z-index: 1;

        }


        .home-warranty-eyebrow {

          color: #e1b12c;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: 2px;

          margin-bottom: 5px;

        }


        .home-warranty-hero h1 {

          margin: 0;

          font-size: 29px;

          line-height: 1.15;

          font-weight: 900;

        }


        .home-warranty-hero p {

          margin: 8px 0 0;

          color: #d8d2d0;

          font-size: 13px;

          line-height: 1.6;

          max-width: 530px;

        }


        .home-warranty-number {

          z-index: 1;

          text-align: center;

          min-width: 75px;

        }


        .home-warranty-number strong {

          display: block;

          color: #e1b12c;

          font-size: 48px;

          line-height: .9;

          font-weight: 900;

        }


        .home-warranty-number span {

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

        .home-warranty-highlights {

          margin: 0 48px;

          padding: 20px 0;

          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          border-bottom: 1px solid #e8e8e8;

        }


        .home-warranty-highlight {

          display: flex;

          align-items: center;

          gap: 14px;

          padding: 8px 20px;

        }


        .home-highlight-icon {

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


        .home-highlight-label {

          display: block;

          color: #999;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.3px;

          margin-bottom: 3px;

        }


        .home-warranty-highlight strong {

          display: block;

          color: #282828;

          font-size: 16px;

        }


        .home-warranty-highlight p {

          margin: 3px 0 0;

          font-size: 10px;

          color: #777;

          line-height: 1.45;

        }


        .home-warranty-divider {

          width: 1px;

          height: 58px;

          background: #e1e1e1;

        }


        /* =====================================================
           GENERAL SECTIONS
        ===================================================== */

        .home-warranty-section {

          margin: 30px 48px;

        }


        .home-section-heading {

          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 15px;

        }


        .home-section-heading-icon {

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


        .home-section-heading-icon.green {

          color: #238b57;

          background: #eefaf3;

        }


        .home-section-heading-icon.orange {

          color: #c26a18;

          background: #fff6e9;

        }


        .home-section-heading span {

          display: block;

          font-size: 8px;

          color: #999;

          font-weight: 900;

          letter-spacing: 1.5px;

        }


        .home-section-heading h2 {

          margin: 2px 0 0;

          font-size: 18px;

          color: #282828;

          font-weight: 850;

        }


        .home-warranty-introduction {

          font-size: 12px;

          line-height: 1.75;

          color: #5d5d5d;

          margin: 7px 0;

        }


        .home-warranty-introduction strong {

          color: #303030;

        }


        /* =====================================================
           COVERAGE LIST
        ===================================================== */

        .home-warranty-list {

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 10px;

        }


        .home-warranty-list-item {

          display: flex;

          gap: 11px;

          padding: 14px;

          border: 1px solid #ececec;

          border-radius: 9px;

          background: #fcfcfc;

        }


        .home-warranty-list-item > svg {

          color: #26965c;

          margin-top: 2px;

          min-width: 15px;

        }


        .home-warranty-list-item strong {

          display: block;

          font-size: 12px;

          color: #333;

          margin-bottom: 3px;

        }


        .home-warranty-list-item p {

          margin: 0;

          font-size: 10px;

          color: #777;

          line-height: 1.55;

        }


        /* =====================================================
           HOME SERVICE PROCESS
        ===================================================== */

        .home-service-process {

          margin: 30px 48px;

          padding: 20px 22px;

          display: flex;

          gap: 15px;

          align-items: flex-start;

          border-radius: 10px;

          background: #f7f8f9;

          border: 1px solid #e4e6e8;

        }


        .home-process-icon {

          width: 45px;

          height: 45px;

          min-width: 45px;

          border-radius: 10px;

          background: #252525;

          color: #e1b12c;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 17px;

        }


        .home-process-content span {

          display: block;

          color: #999;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

        }


        .home-process-content h2 {

          margin: 3px 0 5px;

          font-size: 16px;

          color: #282828;

        }


        .home-process-content p {

          margin: 0;

          color: #666;

          font-size: 10px;

          line-height: 1.6;

        }


        /* =====================================================
           WARRANTY PERIOD
        ===================================================== */

        .home-warranty-period {

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


        .home-period-icon {

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


        .home-period-content span {

          display: block;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

          color: #9b7c18;

        }


        .home-period-content h2 {

          margin: 3px 0;

          font-size: 17px;

          color: #493d1a;

        }


        .home-period-content p {

          margin: 0;

          font-size: 10px;

          color: #746a4a;

          line-height: 1.55;

        }


        /* =====================================================
           RESPONSE COMMITMENT
        ===================================================== */

        .home-response-commitment {

          margin: 30px 48px;

          padding: 20px 22px;

          display: flex;

          gap: 15px;

          align-items: flex-start;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #fff8f7,
              #fffdfc
            );

          border: 1px solid #f0d6d2;

        }


        .home-response-commitment-icon {

          width: 46px;

          height: 46px;

          min-width: 46px;

          border-radius: 50%;

          background: #c0392b;

          color: #fff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 18px;

        }


        .home-response-commitment-content span {

          display: block;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

          color: #a93226;

        }


        .home-response-commitment-content h2 {

          margin: 3px 0 5px;

          font-size: 17px;

          color: #45201c;

        }


        .home-response-commitment-content p {

          margin: 0;

          font-size: 10px;

          color: #6e4b47;

          line-height: 1.6;

        }


        .home-response-commitment-content .home-response-note {

          margin-top: 8px;

          padding-top: 8px;

          border-top: 1px solid #f0d6d2;

          font-size: 9px;

          color: #79544f;

        }


        .home-response-note strong {

          color: #45201c;

        }


        /* =====================================================
           WARRANTY REFERENCE
        ===================================================== */

        .home-warranty-reference {

          margin: 30px 48px;

          padding: 20px 22px;

          display: flex;

          gap: 15px;

          align-items: flex-start;

          border-radius: 10px;

          background: #f7f8f9;

          border: 1px solid #e4e6e8;

        }


        .home-reference-icon {

          width: 45px;

          height: 45px;

          min-width: 45px;

          border-radius: 10px;

          background: #252525;

          color: #e1b12c;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 17px;

        }


        .home-reference-content span {

          display: block;

          color: #999;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

        }


        .home-reference-content h2 {

          margin: 3px 0 5px;

          font-size: 16px;

          color: #282828;

        }


        .home-reference-content p {

          margin: 0;

          color: #666;

          font-size: 10px;

          line-height: 1.6;

        }


        .home-reference-content strong {

          color: #333;

        }


        /* =====================================================
           LOCATION NOTICE
        ===================================================== */

        .home-location-notice {

          margin: 30px 48px;

          padding: 20px 22px;

          display: flex;

          gap: 15px;

          align-items: flex-start;

          border-radius: 10px;

          background: #fff8f7;

          border: 1px solid #f0d6d2;

        }


        .home-location-icon {

          width: 45px;

          height: 45px;

          min-width: 45px;

          border-radius: 10px;

          background: #c0392b;

          color: #fff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 17px;

        }


        .home-location-notice span {

          display: block;

          color: #a93226;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

        }


        .home-location-notice h2 {

          margin: 3px 0 6px;

          font-size: 16px;

          color: #45201c;

        }


        .home-location-notice p {

          margin: 5px 0 0;

          color: #6e4b47;

          font-size: 10px;

          line-height: 1.6;

        }


        /* =====================================================
           EXCLUSIONS
        ===================================================== */

        .home-warranty-exclusions {

          border-left: 3px solid #e1b12c;

          padding: 2px 0 2px 17px;

        }


        .home-warranty-exclusions > p {

          margin: 0 0 10px;

          color: #555;

          font-size: 11px;

          line-height: 1.65;

        }


        .home-warranty-exclusions ul {

          margin: 0;

          padding-left: 18px;

          color: #666;

        }


        .home-warranty-exclusions li {

          font-size: 10px;

          line-height: 1.65;

          padding-left: 3px;

          margin-bottom: 2px;

        }


        /* =====================================================
           CUSTOMER RESPONSE
        ===================================================== */

        .home-response-policy {

          margin: 30px 48px;

          padding: 20px 22px;

          border-radius: 10px;

          background: #f7f8f9;

          border: 1px solid #e4e6e8;

          display: flex;

          gap: 15px;

          align-items: flex-start;

        }


        .home-response-icon {

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


        .home-response-policy span {

          display: block;

          color: #999;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1.5px;

        }


        .home-response-policy h2 {

          margin: 3px 0 5px;

          font-size: 16px;

          color: #282828;

        }


        .home-response-policy p {

          margin: 0;

          color: #666;

          font-size: 10px;

          line-height: 1.6;

        }


        /* =====================================================
           ACKNOWLEDGMENT
        ===================================================== */

        .home-acknowledgment {

          margin: 30px 48px 25px;

          padding: 17px 19px;

          border-radius: 9px;

          background: #fffafa;

          border: 1px solid #f0dddd;

          display: flex;

          gap: 13px;

        }


        .home-acknowledgment-icon {

          color: #c0392b;

          font-size: 17px;

          padding-top: 2px;

        }


        .home-acknowledgment h2 {

          margin: 0 0 5px;

          font-size: 13px;

          color: #333;

        }


        .home-acknowledgment p {

          margin: 0;

          font-size: 9.5px;

          line-height: 1.6;

          color: #6a6a6a;

        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .home-warranty-footer {

          margin: 0 48px;

          padding: 20px 0;

          border-top: 1px solid #e5e5e5;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

        }


        .home-warranty-footer strong {

          display: block;

          font-size: 10px;

          letter-spacing: 1px;

          color: #333;

        }


        .home-warranty-footer > div:first-child span {

          display: block;

          font-size: 8px;

          color: #999;

          margin-top: 4px;

        }


        .home-footer-badge {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #c0392b;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: 1px;

          white-space: nowrap;

        }


        .home-footer-badge span {

          color: #c0392b;

          font-size: 8px;

          font-weight: 900;

        }


        .home-warranty-bottom-line {

          height: 4px;

          background: #252525;

        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 700px) {

          .home-warranty-page {

            padding: 15px 8px;

          }


          .home-warranty-header {

            padding: 25px;

            flex-direction: column;

            align-items: flex-start;

          }


          .home-warranty-document-label {

            text-align: left;

          }


          .home-warranty-hero {

            margin: 20px 25px;

            padding: 22px;

          }


          .home-warranty-hero h1 {

            font-size: 22px;

          }


          .home-warranty-number {

            display: none;

          }


          .home-warranty-highlights {

            margin: 0 25px;

            display: block;

          }


          .home-warranty-divider {

            width: 100%;

            height: 1px;

            margin: 8px 0;

          }


          .home-warranty-highlight {

            padding: 10px 0;

          }


          .home-warranty-section,

          .home-warranty-period,

          .home-service-process,

          .home-response-commitment,

          .home-warranty-reference,

          .home-location-notice,

          .home-response-policy,

          .home-acknowledgment {

            margin-left: 25px;

            margin-right: 25px;

          }


          .home-warranty-list {

            grid-template-columns: 1fr;

          }


          .home-warranty-footer {

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


          .home-warranty-page {

            padding: 0 !important;

            margin: 0 !important;

            background: #fff !important;

            min-height: auto !important;

          }


          .home-warranty-actions {

            display: none !important;

          }


          .home-warranty-paper {

            max-width: none !important;

            width: 100% !important;

            box-shadow: none !important;

            border-radius: 0 !important;

          }


          .home-warranty-top-line,
          .home-warranty-bottom-line,
          .home-warranty-logo,
          .home-warranty-shield,
          .home-period-icon,
          .home-process-icon,
          .home-response-commitment-icon,
          .home-reference-icon,
          .home-location-icon,
          .home-response-icon {

            print-color-adjust: exact;

            -webkit-print-color-adjust: exact;

          }


          .home-warranty-hero,
          .home-warranty-period,
          .home-service-process,
          .home-response-commitment,
          .home-warranty-reference,
          .home-location-notice,
          .home-response-policy,
          .home-acknowledgment,
          .home-warranty-list-item,
          .home-highlight-icon,
          .home-section-heading-icon {

            print-color-adjust: exact;

            -webkit-print-color-adjust: exact;

          }


          .home-warranty-section,
          .home-warranty-period,
          .home-service-process,
          .home-response-commitment,
          .home-warranty-reference,
          .home-location-notice,
          .home-response-policy,
          .home-acknowledgment {

            break-inside: avoid;

            page-break-inside: avoid;

          }


          .home-warranty-header {

            break-inside: avoid;

          }

        }

      `}</style>
    </>
  )
}

export default HomeServiceWarrantyCertificate