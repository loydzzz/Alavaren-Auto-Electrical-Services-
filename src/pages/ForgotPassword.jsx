import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  FaEnvelope,
  FaArrowLeft,
  FaCarBattery,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setLoading(true)

    const redirectTo =
      `${window.location.origin}/reset-password`

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo
        }
      )

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSent(true)

    toast.success(
      'Password reset link sent! Check your email.'
    )
  }

  function handleTryAgain() {
    setSent(false)
    setEmail('')
  }

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            margin: 0;
            min-height: 100%;
          }

          body {
            background: #f1f2f4;
          }

          /* =====================================================
             PAGE
          ===================================================== */

          .forgot-page {
            position: relative;
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            font-family:
              "Segoe UI",
              Arial,
              sans-serif;

            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #f5f5f5 45%,
                #e5e7eb 100%
              );
          }


          /* =====================================================
             BACKGROUND WAVES
          ===================================================== */

          .forgot-background {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }


          .forgot-wave {
            position: absolute;
            left: -5%;
            width: 110%;
            pointer-events: none;
          }


          .forgot-wave svg {
            display: block;
            width: 100%;
            height: 100%;
          }


          .forgot-wave-top {
            top: -70px;
            height: 360px;
          }


          .forgot-wave-middle {
            top: 20%;
            height: 360px;
            opacity: 0.65;
          }


          .forgot-wave-bottom {
            bottom: -80px;
            height: 350px;
          }


          /* =====================================================
             FLOATING GLASS SHAPES
          ===================================================== */

          .forgot-floating-shape {
            position: absolute;

            border-radius: 28px;

            border:
              1px solid rgba(255, 255, 255, 0.7);

            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.7),
                rgba(255, 255, 255, 0.18)
              );

            box-shadow:
              0 25px 60px rgba(31, 41, 55, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);

            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);

            transform: rotate(-12deg);
          }


          .forgot-floating-one {
            width: 210px;
            height: 110px;
            top: 10%;
            left: -70px;
          }


          .forgot-floating-two {
            width: 180px;
            height: 180px;
            top: 16%;
            right: -75px;

            transform: rotate(18deg);
          }


          .forgot-floating-three {
            width: 150px;
            height: 90px;
            bottom: 10%;
            left: 8%;

            transform: rotate(12deg);
          }


          .forgot-floating-four {
            width: 230px;
            height: 120px;
            bottom: 7%;
            right: -80px;

            transform: rotate(-14deg);
          }


          /* =====================================================
             RED ORBS
          ===================================================== */

          .forgot-red-orb {
            position: absolute;

            border-radius: 999px;

            background:
              radial-gradient(
                circle at 35% 30%,
                rgba(231, 76, 60, 0.38),
                rgba(192, 57, 43, 0.08) 55%,
                transparent 72%
              );

            filter: blur(2px);
          }


          .forgot-red-orb-one {
            width: 280px;
            height: 280px;

            top: -120px;
            right: 14%;
          }


          .forgot-red-orb-two {
            width: 220px;
            height: 220px;

            bottom: -90px;
            left: 22%;

            opacity: 0.65;
          }


          /* =====================================================
             MAIN
          ===================================================== */

          .forgot-main {
            position: relative;
            z-index: 5;

            flex: 1;

            width: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            padding:
              clamp(24px, 5vw, 60px)
              16px;
          }


          /* =====================================================
             MAIN CARD
          ===================================================== */

          .forgot-card {
            position: relative;

            display: flex;

            width: 100%;
            max-width: 980px;

            min-height: 560px;

            overflow: hidden;

            border:
              1px solid rgba(255, 255, 255, 0.8);

            border-radius: 30px;

            background:
              rgba(255, 255, 255, 0.88);

            box-shadow:
              0 35px 90px rgba(31, 41, 55, 0.16),
              0 10px 30px rgba(192, 57, 43, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);

            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }


          /* =====================================================
             LEFT BRANDING PANEL
          ===================================================== */

          .forgot-brand-panel {
            position: relative;

            width: 42%;
            min-width: 350px;

            display: flex;
            align-items: flex-end;

            overflow: hidden;

            background-image:
              linear-gradient(
                145deg,
                rgba(192, 57, 43, 0.15),
                rgba(17, 24, 39, 0.25)
              ),
              url('/alavaren.jpg');

            background-size: cover;
            background-position: center;
          }


          /* Red glass overlay */

          .forgot-brand-panel::before {
            content: "";

            position: absolute;
            inset: 0;

            background:
              linear-gradient(
                145deg,
                rgba(192, 57, 43, 0.82) 0%,
                rgba(127, 29, 29, 0.48) 45%,
                rgba(17, 24, 39, 0.78) 100%
              );

            z-index: 0;
          }


          /* Decorative circular waves */

          .forgot-brand-panel::after {
            content: "";

            position: absolute;

            width: 420px;
            height: 420px;

            right: -210px;
            bottom: -210px;

            border-radius: 50%;

            border:
              1px solid rgba(255, 255, 255, 0.18);

            box-shadow:
              0 0 0 35px rgba(255, 255, 255, 0.04),
              0 0 0 70px rgba(255, 255, 255, 0.03);

            z-index: 1;
          }


          .forgot-brand-overlay {
            position: absolute;
            inset: 0;

            z-index: 1;

            background:
              linear-gradient(
                to top,
                rgba(17, 24, 39, 0.82),
                rgba(17, 24, 39, 0.08) 70%
              );
          }


          /* =====================================================
             BRAND CONTENT
          ===================================================== */

          .forgot-brand-content {
            position: relative;

            z-index: 3;

            width: 100%;

            padding: 36px;

            color: white;
          }


          .forgot-brand-title {
            margin: 0;

            max-width: 340px;

            font-size:
              clamp(25px, 3vw, 34px);

            line-height: 1.15;

            font-weight: 800;

            letter-spacing: -0.8px;

            text-shadow:
              0 5px 20px rgba(0, 0, 0, 0.25);
          }


          .forgot-brand-tagline {
            max-width: 330px;

            margin: 12px 0 0;

            font-size: 13px;

            line-height: 1.7;

            color:
              rgba(255, 255, 255, 0.82);
          }


          /* =====================================================
             RIGHT FORM PANEL
          ===================================================== */

          .forgot-form-panel {
            position: relative;

            flex: 1;

            min-width: 0;

            padding:
              clamp(32px, 5vw, 58px);

            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.98),
                rgba(248, 249, 250, 0.94)
              );
          }


          /* Decorative red top line */

          .forgot-form-panel::before {
            content: "";

            position: absolute;

            top: 0;
            right: 40px;

            width: 100px;
            height: 4px;

            border-radius:
              0 0 10px 10px;

            background:
              linear-gradient(
                90deg,
                #922b21,
                #c0392b,
                #e74c3c
              );
          }


          /* =====================================================
             LOGO
          ===================================================== */

          .forgot-logo-row {
            display: flex;

            align-items: center;

            gap: 13px;

            margin-bottom: 30px;
          }


          .forgot-logo {
            position: relative;

            width: 50px;
            height: 50px;

            min-width: 50px;

            display: flex;

            align-items: center;
            justify-content: center;

            color: white;

            border-radius: 16px;

            background:
              linear-gradient(
                145deg,
                #c0392b,
                #922b21
              );

            box-shadow:
              0 12px 25px rgba(192, 57, 43, 0.25);
          }


          .forgot-logo::after {
            content: "";

            position: absolute;

            inset: -5px;

            border-radius: 20px;

            border:
              1px solid rgba(192, 57, 43, 0.12);

            pointer-events: none;
          }


          .forgot-company-name {
            margin: 0;

            color: #1f2937;

            font-size: 15px;

            line-height: 1.3;

            font-weight: 800;
          }


          .forgot-company-subtitle {
            margin: 3px 0 0;

            color: #9ca3af;

            font-size: 10px;

            line-height: 1.5;
          }


          /* =====================================================
             BACK BUTTON
          ===================================================== */

          .forgot-back {
            width: fit-content;

            display: inline-flex;

            align-items: center;

            gap: 8px;

            margin:
              0 0 28px;

            padding:
              7px 10px 7px 0;

            border: none;

            background: transparent;

            color: #9ca3af;

            font-size: 11px;

            font-weight: 700;

            cursor: pointer;

            transition:
              color 0.2s ease,
              transform 0.2s ease;
          }


          .forgot-back:hover {
            color: #c0392b;

            transform:
              translateX(-3px);
          }


          /* =====================================================
             HEADING
          ===================================================== */

          .forgot-label {
            margin-bottom: 7px;

            color: #c0392b;

            font-size: 9px;

            font-weight: 800;

            letter-spacing: 2px;
          }


          .forgot-heading {
            margin: 0 0 7px;

            color: #1f2937;

            font-size:
              clamp(25px, 3vw, 30px);

            line-height: 1.2;

            font-weight: 800;

            letter-spacing: -0.6px;
          }


          .forgot-description {
            max-width: 440px;

            margin:
              0 0 26px;

            color: #9ca3af;

            font-size: 12px;

            line-height: 1.6;
          }


          /* =====================================================
             EMAIL FIELD
          ===================================================== */

          .forgot-field {
            margin-bottom: 17px;
          }


          .forgot-field-label {
            display: block;

            margin-bottom: 7px;

            color: #4b5563;

            font-size: 11px;

            font-weight: 700;
          }


          .forgot-input-box {
            position: relative;

            width: 100%;

            height: 48px;

            display: flex;

            align-items: center;

            border:
              1px solid #e5e7eb;

            border-radius: 12px;

            background:
              rgba(255, 255, 255, 0.92);

            box-shadow:
              0 4px 15px rgba(31, 41, 55, 0.035);

            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease;
          }


          .forgot-input-box:hover {
            border-color: #d1d5db;
          }


          .forgot-input-box:focus-within {
            border-color: #c0392b;

            box-shadow:
              0 0 0 4px rgba(192, 57, 43, 0.07),
              0 8px 20px rgba(31, 41, 55, 0.05);

            transform:
              translateY(-1px);
          }


          .forgot-input-icon {
            flex: 0 0 auto;

            margin-left: 15px;

            color: #9ca3af;

            font-size: 14px;

            transition:
              color 0.2s ease;
          }


          .forgot-input-box:focus-within
          .forgot-input-icon {
            color: #c0392b;
          }


          .forgot-input-box input {
            width: 100%;

            min-width: 0;

            height: 100%;

            border: none;

            outline: none;

            background: transparent;

            padding:
              0 13px;

            color: #1f2937;

            font-size: 13px;
          }


          .forgot-input-box input::placeholder {
            color: #b6bbc3;
          }


          .forgot-input-box input:disabled {
            cursor: not-allowed;

            opacity: 0.6;
          }


          /* =====================================================
             RESET BUTTON
          ===================================================== */

          .forgot-submit {
            position: relative;

            width: 100%;

            min-height: 48px;

            overflow: hidden;

            display: flex;

            align-items: center;

            justify-content: center;

            border: none;

            border-radius: 12px;

            background:
              linear-gradient(
                135deg,
                #c0392b,
                #a93226
              );

            color: white;

            font-size: 13px;

            font-weight: 800;

            cursor: pointer;

            box-shadow:
              0 12px 25px rgba(192, 57, 43, 0.22);

            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }


          /* Button shine */

          .forgot-submit::before {
            content: "";

            position: absolute;

            top: 0;

            left: -100%;

            width: 70%;

            height: 100%;

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(255,255,255,0.18),
                transparent
              );

            transform:
              skewX(-20deg);

            transition:
              left 0.6s ease;
          }


          .forgot-submit:hover:not(:disabled) {
            background:
              linear-gradient(
                135deg,
                #a93226,
                #922b21
              );

            transform:
              translateY(-2px);

            box-shadow:
              0 16px 30px
              rgba(192, 57, 43, 0.28);
          }


          .forgot-submit:hover:not(:disabled)::before {
            left: 130%;
          }


          .forgot-submit:active:not(:disabled) {
            transform:
              translateY(0)
              scale(0.99);
          }


          .forgot-submit:disabled {
            cursor: not-allowed;

            opacity: 0.7;
          }


          /* =====================================================
             SECURITY MESSAGE
          ===================================================== */

          .forgot-security {
            display: flex;

            align-items: flex-start;

            gap: 9px;

            margin-top: 16px;

            padding:
              11px 12px;

            border-radius: 11px;

            background:
              rgba(243, 244, 246, 0.65);

            border:
              1px solid rgba(0, 0, 0, 0.045);

            color: #9ca3af;

            font-size: 9px;

            line-height: 1.55;
          }


          .forgot-security svg {
            flex-shrink: 0;

            margin-top: 1px;

            color: #c0392b;

            font-size: 11px;
          }


          /* =====================================================
             SUCCESS STATE
          ===================================================== */

          .forgot-success {
            padding:
              26px 23px;

            text-align: center;

            border-radius: 18px;

            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.88),
                rgba(247, 247, 247, 0.75)
              );

            border:
              1px solid rgba(0, 0, 0, 0.06);

            box-shadow:
              0 15px 35px
              rgba(0, 0, 0, 0.06);
          }


          .forgot-success-icon {
            width: 58px;
            height: 58px;

            display: flex;

            align-items: center;
            justify-content: center;

            margin:
              0 auto 13px;

            border-radius: 18px;

            color: white;

            background:
              linear-gradient(
                135deg,
                #35a853,
                #218838
              );

            box-shadow:
              0 10px 25px
              rgba(40, 167, 69, 0.22);

            font-size: 25px;
          }


          .forgot-success-label {
            color: #35a853;

            font-size: 8px;

            font-weight: 800;

            letter-spacing: 2px;
          }


          .forgot-success h3 {
            margin:
              7px 0;

            color: #242424;

            font-size: 20px;

            font-weight: 800;
          }


          .forgot-success-description {
            margin:
              0 auto 18px;

            color: #777;

            font-size: 11px;

            line-height: 1.6;
          }


          .forgot-email-display {
            display: block;

            margin-top: 4px;

            color: #333;

            font-weight: 800;

            overflow-wrap: anywhere;
          }


          .forgot-success-info {
            display: flex;

            align-items: flex-start;

            gap: 10px;

            padding: 12px;

            text-align: left;

            border-radius: 11px;

            background:
              rgba(40, 167, 69, 0.06);

            border:
              1px solid rgba(40, 167, 69, 0.10);
          }


          .forgot-success-info-icon {
            color: #35a853;

            font-size: 13px;
          }


          .forgot-success-info strong,
          .forgot-success-info small {
            display: block;
          }


          .forgot-success-info strong {
            margin-bottom: 2px;

            color: #28783c;

            font-size: 10px;
          }


          .forgot-success-info small {
            color: #7c9b83;

            font-size: 9px;

            line-height: 1.4;
          }


          .forgot-try-again {
            margin-top: 18px;

            border: none;

            background: transparent;

            color: #888;

            font-size: 10px;

            cursor: pointer;
          }


          .forgot-try-again:hover {
            text-decoration: underline;
          }


          .forgot-try-again span {
            color: #c0392b;

            font-weight: 800;
          }


          /* =====================================================
             BOTTOM LOGIN
          ===================================================== */

          .forgot-bottom {
            margin-top: 20px;

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 5px;

            color: #9ca3af;

            font-size: 10px;

            line-height: 1.5;
          }


          .forgot-bottom button {
            padding: 3px;

            border: none;

            background: transparent;

            color: #c0392b;

            font-size: 10px;

            font-weight: 800;

            cursor: pointer;
          }


          .forgot-bottom button:hover {
            text-decoration: underline;
          }


          /* =====================================================
             FOOTER
          ===================================================== */

          .forgot-footer {
            position: relative;

            z-index: 5;

            width: 100%;

            padding:
              12px 16px 18px;

            color:
              rgba(75, 85, 99, 0.55);

            text-align: center;

            font-size: 9px;

            font-weight: 600;

            letter-spacing: 0.2px;
          }


          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 900px) {

            .forgot-main {
              padding:
                30px 20px;
            }


            .forgot-card {
              max-width: 760px;

              min-height: 520px;

              border-radius: 26px;
            }


            .forgot-brand-panel {
              width: 38%;

              min-width: 280px;
            }


            .forgot-brand-content {
              padding: 28px;
            }


            .forgot-form-panel {
              padding: 36px;
            }


            .forgot-floating-one {
              left: -110px;
            }


            .forgot-floating-two {
              right: -110px;
            }
          }


          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 680px) {

            .forgot-page {
              background:
                linear-gradient(
                  145deg,
                  #ffffff 0%,
                  #f5f5f5 50%,
                  #e5e7eb 100%
                );
            }


            .forgot-main {
              align-items: flex-start;

              padding:
                18px 12px 14px;
            }


            .forgot-card {
              width: 100%;

              max-width: 500px;

              min-height: auto;

              flex-direction: column;

              border-radius: 24px;

              box-shadow:
                0 25px 60px
                rgba(31, 41, 55, 0.13);
            }


            /* Mobile branding */

            .forgot-brand-panel {
              width: 100%;

              min-width: 0;

              height: 175px;

              min-height: 175px;

              align-items: flex-end;
            }


            .forgot-brand-content {
              padding:
                20px 22px 22px;
            }


            .forgot-brand-title {
              max-width: 290px;

              font-size: 22px;
            }


            .forgot-brand-tagline {
              max-width: 280px;

              margin-top: 7px;

              font-size: 11px;
            }


            /* Form */

            .forgot-form-panel {
              width: 100%;

              padding:
                28px 22px 25px;
            }


            .forgot-form-panel::before {
              right: 24px;

              width: 70px;
            }


            .forgot-logo-row {
              margin-bottom: 22px;
            }


            .forgot-logo {
              width: 45px;
              height: 45px;

              min-width: 45px;

              border-radius: 14px;
            }


            .forgot-company-name {
              font-size: 13px;
            }


            .forgot-company-subtitle {
              max-width: 230px;

              font-size: 9px;
            }


            .forgot-back {
              margin-bottom: 22px;
            }


            .forgot-heading {
              font-size: 23px;
            }


            .forgot-description {
              margin-bottom: 22px;

              font-size: 11px;
            }


            .forgot-input-box {
              height: 49px;

              border-radius: 11px;
            }


            /*
              Prevent iPhone Safari from zooming
              into the email field.
            */

            .forgot-input-box input {
              font-size: 16px;
            }


            .forgot-submit {
              min-height: 49px;

              border-radius: 11px;
            }


            .forgot-security {
              font-size: 8px;
            }


            .forgot-bottom {
              margin-top: 18px;
            }


            /* Decorative shapes */

            .forgot-floating-one {
              width: 140px;
              height: 75px;

              top: 4%;
              left: -95px;
            }


            .forgot-floating-two {
              width: 120px;
              height: 120px;

              top: 24%;
              right: -75px;
            }


            .forgot-floating-three {
              width: 110px;
              height: 65px;

              bottom: 8%;
              left: -35px;
            }


            .forgot-floating-four {
              width: 140px;
              height: 75px;

              bottom: 3%;
              right: -70px;
            }


            .forgot-red-orb-one {
              width: 180px;
              height: 180px;

              right: -70px;
              top: -60px;
            }


            .forgot-red-orb-two {
              width: 150px;
              height: 150px;

              left: -50px;
              bottom: -50px;
            }
          }


          /* =====================================================
             SMALL PHONES
          ===================================================== */

          @media (max-width: 390px) {

            .forgot-main {
              padding:
                10px 8px 10px;
            }


            .forgot-card {
              border-radius: 20px;
            }


            .forgot-brand-panel {
              height: 145px;

              min-height: 145px;
            }


            .forgot-brand-content {
              padding:
                17px 18px;
            }


            .forgot-brand-title {
              font-size: 19px;
            }


            .forgot-brand-tagline {
              font-size: 10px;
            }


            .forgot-form-panel {
              padding:
                23px 17px 21px;
            }


            .forgot-logo {
              width: 42px;
              height: 42px;

              min-width: 42px;
            }


            .forgot-company-name {
              font-size: 12px;
            }


            .forgot-company-subtitle {
              font-size: 8px;
            }


            .forgot-heading {
              font-size: 21px;
            }


            .forgot-description {
              font-size: 10px;
            }


            .forgot-input-box {
              height: 47px;
            }


            .forgot-submit {
              min-height: 47px;
            }


            .forgot-success {
              padding:
                23px 17px;
            }


            .forgot-footer {
              padding:
                8px 10px 12px;

              font-size: 8px;
            }
          }


          /* =====================================================
             REDUCED MOTION
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
              scroll-behavior: auto !important;

              transition-duration:
                0.01ms !important;

              animation-duration:
                0.01ms !important;

              animation-iteration-count:
                1 !important;
            }
          }
        `}
      </style>


      <div className="forgot-page">

        {/* =====================================================
            BACKGROUND
        ===================================================== */}

        <div className="forgot-background">

          {/* RED TOP WAVE */}

          <div className="forgot-wave forgot-wave-top">

            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >

              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="
                  M0,150
                  C180,60 330,230 510,150
                  C690,70 810,20 1000,110
                  C1190,200 1300,210 1440,100
                  L1440,0
                  L0,0
                  Z
                "
              />

            </svg>

          </div>


          {/* GRAY WAVE */}

          <div className="forgot-wave forgot-wave-middle">

            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >

              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="
                  M0,210
                  C180,120 330,310 520,230
                  C700,155 800,90 980,180
                  C1160,270 1280,310 1440,190
                  L1440,400
                  L0,400
                  Z
                "
              />

            </svg>

          </div>


          {/* BOTTOM RED WAVE */}

          <div className="forgot-wave forgot-wave-bottom">

            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >

              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="
                  M0,270
                  C190,180 340,330 530,250
                  C720,170 820,110 1000,220
                  C1170,325 1280,310 1440,230
                  L1440,400
                  L0,400
                  Z
                "
              />

            </svg>

          </div>


          {/* FLOATING GLASS SHAPES */}

          <div
            className="
              forgot-floating-shape
              forgot-floating-one
            "
          />

          <div
            className="
              forgot-floating-shape
              forgot-floating-two
            "
          />

          <div
            className="
              forgot-floating-shape
              forgot-floating-three
            "
          />

          <div
            className="
              forgot-floating-shape
              forgot-floating-four
            "
          />


          {/* RED LIGHT EFFECTS */}

          <div
            className="
              forgot-red-orb
              forgot-red-orb-one
            "
          />

          <div
            className="
              forgot-red-orb
              forgot-red-orb-two
            "
          />

        </div>


        {/* =====================================================
            TOAST
        ===================================================== */}

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '13px',
              maxWidth: '90vw',
              borderRadius: '12px'
            }
          }}
        />


        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="forgot-main">

          <div className="forgot-card">

            {/* =================================================
                LEFT BRANDING
            ================================================= */}

            <div className="forgot-brand-panel">

              <div className="forgot-brand-overlay" />

              <div className="forgot-brand-content">

                <h2 className="forgot-brand-title">
                  Alavaren Auto Electrical
                </h2>

                <p className="forgot-brand-tagline">
                  "Driven by quality, powered by trust."
                </p>

              </div>

            </div>


            {/* =================================================
                RIGHT FORM
            ================================================= */}

            <div className="forgot-form-panel">

              {/* =================================================
                  LOGO
              ================================================= */}

              <div className="forgot-logo-row">

                <div className="forgot-logo">
                  <FaCarBattery size={20} />
                </div>

                <div>

                  <p className="forgot-company-name">
                    Alavaren Auto Electrical
                  </p>

                  <p className="forgot-company-subtitle">
                    Appointment & Inventory Management System
                  </p>

                </div>

              </div>


              {/* =================================================
                  BACK
              ================================================= */}

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="forgot-back"
              >

                <FaArrowLeft />

                <span>
                  Back to Login
                </span>

              </button>


              {/* =================================================
                  HEADING
              ================================================= */}

              <div className="forgot-label">
                ACCOUNT RECOVERY
              </div>

              <h2 className="forgot-heading">
                Forgot Password?
              </h2>

              <p className="forgot-description">

                {sent
                  ? 'Your password reset request has been processed successfully.'
                  : "Enter your registered email address and we'll send you a secure link to reset your password."}

              </p>


              {/* =================================================
                  SUCCESS STATE
              ================================================= */}

              {sent ? (

                <div className="forgot-success">

                  <div className="forgot-success-icon">

                    <FaCheckCircle />

                  </div>


                  <div className="forgot-success-label">
                    PASSWORD RESET
                  </div>


                  <h3>
                    Reset Link Sent
                  </h3>


                  <p className="forgot-success-description">

                    We sent a password reset link to

                    <strong className="forgot-email-display">
                      {email}
                    </strong>

                  </p>


                  <div className="forgot-success-info">

                    <FaShieldAlt
                      className="
                        forgot-success-info-icon
                      "
                    />

                    <div>

                      <strong>
                        Check your inbox
                      </strong>

                      <small>
                        Open the email and follow the
                        instructions to create a new
                        password.
                      </small>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="forgot-try-again"
                  >

                    Didn't receive it?

                    <span>
                      {' '}Try again
                    </span>

                  </button>

                </div>

              ) : (

                /* =================================================
                   RESET FORM
                ================================================= */

                <form onSubmit={handleSubmit}>

                  <div className="forgot-field">

                    <label
                      htmlFor="forgot-email"
                      className="forgot-field-label"
                    >
                      Email
                    </label>


                    <div className="forgot-input-box">

                      <FaEnvelope
                        className="
                          forgot-input-icon
                        "
                      />


                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={e =>
                          setEmail(e.target.value)
                        }
                        disabled={loading}
                        autoComplete="email"
                      />

                    </div>

                  </div>


                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <button
                    type="submit"
                    className="forgot-submit"
                    disabled={loading}
                  >

                    {loading
                      ? 'Sending reset link...'
                      : 'Send Reset Link'}

                  </button>


                  {/* =================================================
                      SECURITY
                  ================================================= */}

                  <div className="forgot-security">

                    <FaShieldAlt />

                    <span>
                      Your account information remains
                      protected. We will only use your
                      email to send the password reset
                      instructions.
                    </span>

                  </div>

                </form>

              )}


              {/* =================================================
                  BOTTOM LOGIN
              ================================================= */}

              <div className="forgot-bottom">

                <span>
                  Remember your password?
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>

              </div>

            </div>

          </div>

        </main>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="forgot-footer">

          © {new Date().getFullYear()}
          {' '}
          Alavaren Auto Electrical Services.
          {' '}
          All rights reserved.

        </footer>

      </div>
    </>
  )
}
