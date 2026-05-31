export default function LandingFooter() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-12">
      <div className="container mx-auto px-4 text-center">
        <h4 className="text-xl font-black text-white mb-2">CourtManager</h4>
        <p className="text-white/40 text-sm mb-6">Nền tảng quản trị học viện thể thao hàng đầu.</p>
        
        <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
          <a href="#" className="text-white/40 hover:text-white transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="text-white/40 hover:text-white transition-colors">Chính sách bảo mật</a>
        </div>
        
        <p className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()} CourtManager Software. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
