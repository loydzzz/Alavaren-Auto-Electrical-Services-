import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { FaLock, FaEye, FaEyeSlash, FaCarBattery } from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const navigate = useNavigate()

  // Listen for auth state changes — Supabase will auto-establish session
  // when user clicks the reset link from email
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true)
          setValidating(false)
        } else if (event === 'SIGNED_IN' && session) {
          // Also handle cases where session is already established
          setSessionReady(true)
          setValidating(false)
        }
      }
    )

    // Also check if we already have a session (e.g. on refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
        setValidating(false)
      } else {
        // If no session after a short delay, show error
        setTimeout(() => {
          setValidating(false)
        }, 2000)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!password.trim()) {
      toast.error('Please enter a new password.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password updated successfully!')

    // Sign out and redirect to login after a brief delay
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, 2000)
  }

  if (validating) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundColor: '#f5f5f5',
          overflowX: 'hidden',
        }}
      >
        <div className="text-center w-full max-w-sm">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#c0392b' }}
          />
          <p className="text-gray-600 text-sm">
            Verifying your reset link...
          </p>
        </div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-6"
        style={{
          backgroundColor: '#f5f5f5',
          overflowX: 'hidden',
        }}
      >
        <Toaster position="top-center" />

        <div
          className="bg-white rounded-lg shadow-lg w-full text-center"
          style={{
            maxWidth: '420px',
            padding: 'clamp(24px, 6vw, 32px)',
          }}
        >
          <div className="text-4xl mb-4">⚠️</div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Invalid or Expired Link
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request
            a new one.
          </p>

          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-2 rounded font-semibold text-white"
            style={{
              backgroundColor: '#c0392b',
              minHeight: '42px',
            }}
          >
            Request New Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#f5f5f5',
        overflowX: 'hidden',
      }}
    >
      <Toaster position="top-center" />

      <div
        className="flex-1 flex items-center justify-center"
        style={{
          padding: 'clamp(12px, 4vw, 24px)',
        }}
      >
        <div
          className="login-card w-full"
          style={{
            maxWidth: '1024px',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {/* Left Branding Panel */}
          <div
            className="reset-branding-panel"
            style={{
              width: '320px',
              minHeight: '500px',
              display: 'flex',
              alignItems: 'flex-end',
              backgroundImage: "url('/alavaren.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Dark Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.45)',
              }}
            />

            {/* Branding Text */}
            <div
              style={{
                position: 'relative',
                color: 'white',
                padding: '24px',
                width: '100%',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  margin: 0,
                }}
              >
                Alavaren Auto Electrical
              </h2>

              <p
                style={{
                  marginTop: '10px',
                  fontSize: '14px',
                  color: '#ddd',
                  lineHeight: '1.5',
                  marginBottom: 0,
                }}
              >
                "Driven by quality, powered by trust."
              </p>
            </div>
          </div>

          {/* Right - Reset Password Form */}
          <div
            className="flex-1 bg-white reset-form-panel"
            style={{
              minWidth: 0,
              padding: 'clamp(20px, 4vw, 32px)',
            }}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-3"
              style={{
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  minWidth: '45px',
                  backgroundColor: '#c0392b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(192,57,43,0.3)',
                }}
              >
                <FaCarBattery size={20} />
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    fontWeight: '700',
                    fontSize: '15px',
                    color: '#222',
                    margin: 0,
                    lineHeight: '1.3',
                  }}
                >
                  Alavaren Auto Electrical
                </p>

                <p
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  Appointment & Inventory Management System
                </p>
              </div>
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#222',
                marginBottom: '4px',
                lineHeight: '1.3',
              }}
            >
              Reset Your Password
            </h2>

            <p
              style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '20px',
                lineHeight: '1.5',
              }}
            >
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="mb-3">
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  New Password
                </label>

                <div
                  className="input-box password-box"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <FaLock className="input-icon" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#555',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Confirm New Password
                </label>

                <div
                  className="input-box password-box"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <FaLock className="input-icon" />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-btn"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  backgroundColor: '#c0392b',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '12px',
          fontSize: '11px',
          color: '#aaa',
          lineHeight: '1.5',
        }}
      >
        © {new Date().getFullYear()} Alavaren Auto Electrical Services. All
        rights reserved.
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .reset-branding-panel {
            width: 100% !important;
            min-height: 190px !important;
            height: 190px !important;
            flex-shrink: 0 !important;
          }

          .reset-branding-panel > div:last-child {
            padding: 20px !important;
          }

          .reset-branding-panel h2 {
            font-size: 20px !important;
          }

          .reset-branding-panel p {
            font-size: 12px !important;
            margin-top: 7px !important;
          }

          .reset-form-panel {
            width: 100% !important;
            padding: 22px 18px 24px !important;
          }

          .login-card {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 430px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 380px) {
          .reset-branding-panel {
            min-height: 165px !important;
            height: 165px !important;
          }

          .reset-branding-panel > div:last-child {
            padding: 16px !important;
          }

          .reset-branding-panel h2 {
            font-size: 18px !important;
          }

          .reset-form-panel {
            padding: 18px 15px 20px !important;
          }

          .reset-form-panel p {
            font-size: 11px;
          }
        }

        @media (max-width: 767px) and (max-height: 700px) {
          .reset-branding-panel {
            min-height: 145px !important;
            height: 145px !important;
          }

          .reset-branding-panel > div:last-child {
            padding: 14px 16px !important;
          }

          .reset-form-panel {
            padding-top: 18px !important;
            padding-bottom: 18px !important;
          }
        }

        input {
          min-width: 0;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  )
}
