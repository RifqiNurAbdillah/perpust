document.addEventListener('DOMContentLoaded', () => {
  const profileBtn = document.getElementById('profile-btn');
  const sidebar = document.getElementById('profile-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('close-sidebar');

  const openSidebar = () => {
    sidebar.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  };

  profileBtn?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
});
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const burgerIcon = document.getElementById('burger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
          // Toggle Menu Visibility
          mobileMenu.classList.toggle('hidden');
          
          // Toggle Icon (Bars vs Times)
          burgerIcon.classList.toggle('hidden');
          closeIcon.classList.toggle('hidden');
      });
  }
});