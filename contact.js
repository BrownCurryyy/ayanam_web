// raw vanilla JS + supabase

// make sure you have these in your Vercel env
// VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
const supabaseKey = import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or anon key missing in env!');
}

const supabase = supabase.createClient
  ? supabase.createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.error('Supabase client not initialized');
}

// fallback: vanilla way without ESM (for normal HTML/JS)
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/supabase.min.js';
script.onload = () => initForm();
document.body.appendChild(script);

function initForm() {
  const supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
  );

  const form = document.getElementById('contactForm');
  const statusDiv = document.getElementById('status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || !email || !message) {
      statusDiv.textContent = 'Please fill all fields';
      return;
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);

    if (error) {
      console.error(error);
      statusDiv.textContent = 'Error sending message 😬';
    } else {
      statusDiv.textContent = 'Message sent ✅';
      form.reset();
    }
  });
}
