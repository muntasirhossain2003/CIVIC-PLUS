import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { issueApi, uploadApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { Field } from '../../components/ui/Field';
import { Btn } from '../../components/ui/Btn';
import { StatusPill } from '../../components/ui/StatusPill';
import type { Issue } from '../../types';
import { MapPin, Camera, AlertTriangle, ChevronRight, ChevronLeft, Check } from 'lucide-react';

type Step = 'location' | 'details' | 'photos' | 'review';
const STEPS: Step[] = ['location', 'details', 'photos', 'review'];
const STEP_LABELS = { location: 'Location', details: 'Details', photos: 'Photos', review: 'Review & submit' };

interface FormState {
  address: string;
  lat: number | null;
  lng: number | null;
  title: string;
  description: string;
  category: string;
  severity: string;
  photos: string[]; // S3 keys
}

const CATEGORIES = ['pothole', 'streetlight', 'garbage', 'water', 'drainage', 'power', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: i < idx ? 'var(--civic)' : i === idx ? 'var(--pulse)' : 'var(--ink-3)',
              border: `1px solid ${i <= idx ? 'transparent' : 'var(--line-2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: i <= idx ? 'var(--ink)' : 'var(--muted-2)',
            }}>
              {i < idx ? <Check size={12} /> : i + 1}
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: i === idx ? 'var(--pulse)' : 'var(--muted-2)',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              height: 1,
              flex: 1,
              background: i < idx ? 'var(--civic)' : 'var(--line-2)',
              margin: '-14px 8px 0',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function DuplicateCard({ duplicates }: { duplicates: Issue[] }) {
  if (duplicates.length === 0) return null;
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--paper-2)',
      borderRadius: 'var(--radius-card)',
      padding: '20px',
      margin: '16px 0',
      color: 'var(--ink)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <AlertTriangle size={16} style={{ color: 'oklch(0.66 0.21 25)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'oklch(0.66 0.21 25)', letterSpacing: '0.1em', fontWeight: 600 }}>
          POSSIBLE DUPLICATES NEARBY
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'rgba(11,18,32,0.7)', margin: '0 0 12px', lineHeight: 1.5 }}>
        {duplicates.length} similar {duplicates.length === 1 ? 'issue' : 'issues'} reported within 50 m in the last 30 days. You can still submit — your report adds evidence.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {duplicates.slice(0, 3).map((d) => (
          <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--paper-line)', paddingTop: 8 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--ink)', flex: 1 }}>{d.title}</span>
            <StatusPill status={d.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('location');
  const [form, setForm] = useState<FormState>({
    address: '', lat: null, lng: null,
    title: '', description: '', category: '', severity: 'medium',
    photos: [],
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Nearby duplicates query — runs when we have coordinates
  const { data: dupData } = useQuery({
    queryKey: ['nearby', form.lat, form.lng, form.category],
    queryFn: () => issueApi.nearby(form.lng!, form.lat!).then((r) => r.data as Issue[]),
    enabled: form.lat !== null && form.lng !== null && step !== 'location',
  });

  const duplicates: Issue[] = dupData ?? [];

  function getLocation() {
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude);
        set('lng', pos.coords.longitude);
        set('address', `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => {
        setLocError('Could not get location. Please enter address manually or allow GPS.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const keys: string[] = [];
    for (const file of files.slice(0, 5)) {
      try {
        const res = await uploadApi.presignedUrl(file.name, file.type);
        const { url, key } = res.data as { url: string; key: string };
        await axios.put(url, file, { headers: { 'Content-Type': file.type } });
        keys.push(key);
      } catch { /* skip failed uploads */ }
    }
    set('photos', [...form.photos, ...keys]);
    setUploading(false);
  }, [form.photos]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        severity: form.severity,
        location: { type: 'Point', coordinates: [form.lng!, form.lat!] },
        address: form.address,
        photos: form.photos,
      };
      const res = await issueApi.create(payload);
      const issue = res.data as Issue;
      navigate(`/issues/${issue._id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSubmitError(e.response?.data?.message ?? 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }
  function prev() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const canNext = {
    location: !!form.address,
    details:  !!form.title && form.title.length >= 5 && !!form.description && form.description.length >= 20 && !!form.category,
    photos:   true,
    review:   true,
  }[step];

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 48px)', maxWidth: 680 }}>
      <CanvasHead
        eyebrow="Citizen portal — report"
        title={<>Submit a <em>civic</em> issue</>}
      />

      <StepIndicator current={step} />

      {/* ── Step: Location ── */}
      {step === 'location' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fade-up 0.3s ease both' }}>
          <Btn onClick={getLocation} disabled={locating} variant="ghost" style={{ alignSelf: 'flex-start' }}>
            <MapPin size={14} />
            {locating ? 'Getting location…' : 'Use my GPS location'}
          </Btn>

          {locError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>{locError}</p>}

          <Field
            label="Address / landmark"
            type="text"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="e.g. Gulshan Ave, Dhaka"
          />

          {form.lat && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--civic)', margin: 0 }}>
              ✓ GPS captured — {form.lat.toFixed(5)}, {form.lng!.toFixed(5)}
            </p>
          )}
        </div>
      )}

      {/* ── Step: Details ── */}
      {step === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fade-up 0.3s ease both' }}>
          <DuplicateCard duplicates={duplicates} />

          <Field
            label="Issue title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Large pothole at Mirpur 10 roundabout"
            maxLength={100}
          />

          <Field
            label="Description"
            textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the issue in detail — size, impact, how long it's been there…"
            maxLength={1000}
          />

          <div>
            <Eyebrow>Category</Eyebrow>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => set('category', c)}
                  style={{
                    background: form.category === c ? 'var(--pulse-soft)' : 'transparent',
                    border: `1px solid ${form.category === c ? 'var(--pulse)' : 'var(--line-2)'}`,
                    borderRadius: 'var(--radius-card)',
                    color: form.category === c ? 'var(--pulse)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    padding: '5px 12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Severity</Eyebrow>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => set('severity', s)}
                  style={{
                    background: form.severity === s ? 'var(--pulse-soft)' : 'transparent',
                    border: `1px solid ${form.severity === s ? 'var(--pulse)' : 'var(--line-2)'}`,
                    borderRadius: 'var(--radius-card)',
                    color: form.severity === s ? 'var(--pulse)' : 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    padding: '5px 12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Photos ── */}
      {step === 'photos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fade-up 0.3s ease both' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
            Photo evidence speeds up resolution. Upload up to 5 images — they go directly to S3.
          </p>

          <label style={{
            border: '2px dashed var(--line-2)',
            borderRadius: 'var(--radius-card)',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'block',
          }}>
            <Camera size={24} style={{ color: 'var(--ink-2)', marginBottom: 8 }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-2)', margin: 0, letterSpacing: '0.06em' }}>
              {uploading ? 'Uploading…' : 'Click to choose photos (max 5)'}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading || form.photos.length >= 5}
            />
          </label>

          {form.photos.length > 0 && (
            <div>
              <Eyebrow>{form.photos.length} photo{form.photos.length !== 1 ? 's' : ''} uploaded</Eyebrow>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {form.photos.map((key, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid var(--civic)',
                    borderRadius: 'var(--radius-card)',
                    padding: '4px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: 'var(--civic)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Check size={10} />
                    {key.split('/').pop()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step: Review ── */}
      {step === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fade-up 0.3s ease both' }}>
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}>
            {[
              ['Location', form.address],
              ['Category', form.category],
              ['Severity', form.severity],
              ['Photos', `${form.photos.length} uploaded`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 24, padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', letterSpacing: '0.08em', width: 90, flexShrink: 0, marginTop: 1 }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink)', textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Title
              </span>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--ink)', margin: 0, fontWeight: 500 }}>{form.title}</p>
            </div>
            <div style={{ padding: '12px 20px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-3)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Description
              </span>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>{form.description}</p>
            </div>
          </div>

          {submitError && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--alert)', margin: 0 }}>{submitError}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <Btn
          variant="ghost"
          onClick={prev}
          disabled={step === 'location'}
          style={{ visibility: step === 'location' ? 'hidden' : 'visible' }}
        >
          <ChevronLeft size={14} />
          Back
        </Btn>

        {step === 'review' ? (
          <Btn onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit issue'}
            <Check size={14} />
          </Btn>
        ) : (
          <Btn onClick={next} disabled={!canNext}>
            Next
            <ChevronRight size={14} />
          </Btn>
        )}
      </div>
    </div>
  );
}
