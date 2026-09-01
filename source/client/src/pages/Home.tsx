import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import MobileBottomCTA from "@/components/MobileBottomCTA";
import { trackConsultationSubmit, trackPhoneClick, trackKakaoClick, trackProgramClick, trackVideoPlay } from "@/lib/analytics";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, ChevronRight, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Star, Users } from "lucide-react";
import { useState, useEffect } from "react";

const featuredVideos = [
  { id: 'WyIfrC4Oh8M', title: '비버솜사탕쇼', description: '비버컴퍼니의 대표 솜사탕 공연입니다.' },
  { id: 'BcLgIZyznj4', title: '스페셜 비버솜사탕쇼', description: '비버컴퍼니에서만 만나보는 특별한 공연, 스페셜 비버솜사탕쇼로 축제 현장, 큰 공연에서 진행하는 특별한 대형 공연도 있습니다.' },
  { id: '-3QblCXnUUQ', title: '비버컴퍼니 코믹클래식 공연', description: '비버컴퍼니 홍보영상' },
  { id: 'rkKUbkzNd2A', title: '운동회·야유회 공연 현장', description: '비버컴퍼니 홍보영상' },
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  // 유입 경로 수집 (최초 방문 시 저장)
  const [trafficSource] = useState(() => {
    // sessionStorage에서 이미 저장된 유입 경로 확인
    const saved = sessionStorage.getItem('traffic_source');
    if (saved) return JSON.parse(saved);

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const referrer = document.referrer;

    let source = '직접 접속';
    let medium = 'direct';

    if (utmSource) {
      source = utmSource;
      medium = utmMedium || 'unknown';
    } else if (referrer) {
      if (referrer.includes('google')) { source = '구글 검색'; medium = 'organic'; }
      else if (referrer.includes('naver')) { source = '네이버 검색'; medium = 'organic'; }
      else if (referrer.includes('kakao') || referrer.includes('kakaotalk')) { source = '카카오'; medium = 'social'; }
      else if (referrer.includes('instagram')) { source = '인스타그램'; medium = 'social'; }
      else if (referrer.includes('youtube')) { source = '유튜브'; medium = 'social'; }
      else if (referrer.includes('facebook')) { source = '페이스북'; medium = 'social'; }
      else { source = referrer.split('/')[2] || '외부 링크'; medium = 'referral'; }
    }

    const result = { source, medium, campaign: utmCampaign || '', referrer };
    sessionStorage.setItem('traffic_source', JSON.stringify(result));
    return result;
  });

  const [formData, setFormData] = useState({
    organization: '',
    phone: '',
    performance: '',
    date: '',
    message: ''
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  const submitConsultation = trpc.consultation.submit.useMutation({
    onSuccess: () => {
      toast.success("문의가 정상적으로 전송되었습니다!", {
        description: "빠른 시일 내에 답변 드리겠습니다.",
      });
      // GA4 상담 신청 완료 이벤트 트래킹
      trackConsultationSubmit(formData.performance);
      setFormData({
        organization: '',
        phone: '',
        performance: '',
        date: '',
        message: ''
      });
      setPrivacyAgreed(false);
    },
    onError: (error) => {
      toast.error("전송 실패", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organization || !formData.phone || !formData.message) {
      toast.error("입력 오류", {
        description: "필수 항목을 모두 입력해주세요.",
      });
      return;
    }
    if (!privacyAgreed) {
      toast.error("개인정보 동의 필요", {
        description: "개인정보 수집·이용에 동의해주세요.",
      });
      return;
    }
    submitConsultation.mutate({
      ...formData,
      source: trafficSource.source,
      medium: trafficSource.medium,
      campaign: trafficSource.campaign,
      referrerUrl: trafficSource.referrer,
    });
  };

  useEffect(() => {
    // Fetch Blog Posts - 비버선생님후기 카테고리만 필터링
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        // "비버선생님후기" 또는 "비버선생님행사후기" 카테고리만 필터링
        const filtered = data.filter((post: any) => 
          post.category && (post.category.includes('비버선생님후기') || post.category.includes('비버선생님행사후기'))
        );
        setBlogPosts(filtered.slice(0, 6)); // 최대 6개만 표시
      })
      .catch(err => console.error('Failed to fetch blog posts:', err));

  }, []);

  const programs = [
    {
      title: "솜사탕쇼",
      description: "비버선생님이 개발한 솜사탕으로 진행되는 퍼포먼스 콘서트 공연입니다.",
      image: "/images/cotton_candy_real.png",
      tags: ["달콤함", "인기만점"],
      color: "bg-pink-100 text-pink-700",
    },
    {
      title: "코믹클래식",
      description: "아이들의 눈높이에 맞춘 해설과 유머가 있는 코믹 클래식 공연입니다.",
      image: "/images/comic_classic_show.jpg",
      tags: ["클래식", "교육적"],
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "운동회",
      description: "실내·야외 모두 가능한 신나는 운동회와 야유회 프로그램입니다.",
      image: "/images/sports_day.png",
      tags: ["실내 가능", "야외 가능"],
      color: "bg-green-100 text-green-700",
    },
    {
      title: "학예회·발표회",
      description: "학예회, 발표회, 예술제 등 무대 행사를 위한 진행과 공연을 준비합니다.",
      image: "/images/trust_reason_photo.png",
      tags: ["행사 진행", "무대 공연"],
      color: "bg-rose-100 text-rose-700",
    },
  ];

  const reviews = [
    {
      name: "김하은 어머님",
      role: "학부모",
      content: "아이 생일에 솜사탕쇼를 불렀는데 정말 최고였어요! 아이들이 너무 좋아해서 뿌듯했습니다.",
      rating: 5,
    },
    {
      name: "박민수 선생님",
      role: "유치원 교사",
      content: "매년 비버컴퍼니와 함께하고 있습니다. 아이들 눈높이에 맞춘 진행이 정말 탁월해요.",
      rating: 5,
    },
    {
      name: "이서연 원장님",
      role: "어린이집 원장",
      content: "안전하고 즐거운 공연 감사합니다. 학부모님들 반응도 너무 좋았어요.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF9E7] font-sans selection:bg-primary/30">
      {/* Top Bar for Contact Info - 4060 Friendly */}
      <div className="bg-stone-900 text-white py-2 px-4 hidden md:block">
        <div className="container flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> 안전 인증 완료</span>
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> 전문 공연자 파견</span>
          </div>
          <div className="flex items-center gap-6 font-bold">
            <span className="flex items-center gap-2 text-primary"><Phone className="w-4 h-4" /> 공연 문의: 010-4808-9382</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-100 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-heading font-bold text-amber-500 tracking-tight">비버컴퍼니</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 font-bold text-lg text-stone-700">
            <a href="#home" className="hover:text-primary transition-colors">홈</a>
            <a href="#programs" className="hover:text-primary transition-colors">공연 프로그램</a>
            <a href="#about" className="hover:text-primary transition-colors">회사 소개</a>
            <a href="#reviews" className="hover:text-primary transition-colors">이용 후기</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-primary transition-colors">문의하기</a>
            <div className="flex items-center gap-3">
              <Button 
                className="rounded-full bg-yellow-400 text-stone-900 hover:bg-yellow-500 font-bold text-lg px-6 shadow-md"
                asChild
              >
                <a href="https://pf.kakao.com/_rXDin/chat" target="_blank" rel="noopener noreferrer" onClick={() => trackKakaoClick('header')}>
                  <MessageCircle className="w-5 h-5 mr-2" /> 카카오톡
                </a>
              </Button>
              <Button 
                className="rounded-full bg-primary text-stone-900 hover:bg-primary/90 font-bold text-lg px-6 shadow-md"
                asChild
              >
                <a href="tel:010-4808-9382" onClick={() => trackPhoneClick('header')}>
                  <Phone className="w-5 h-5 mr-2" /> 전화 상담
                </a>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-8 h-1 bg-stone-800 mb-2 rounded-full"></div>
            <div className="w-8 h-1 bg-stone-800 mb-2 rounded-full"></div>
            <div className="w-8 h-1 bg-stone-800 rounded-full"></div>
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-amber-100 p-6 flex flex-col gap-6 shadow-lg z-50">
            <a href="#home" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>홈</a>
            <a href="#programs" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>공연 프로그램</a>
            <a href="#about" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>회사 소개</a>
            <a href="#reviews" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>이용 후기</a>
            <a href="#faq" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <a href="#contact" className="text-xl font-bold text-stone-800" onClick={() => setIsMenuOpen(false)}>문의하기</a>
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <Button 
                className="w-full rounded-full bg-yellow-400 text-stone-900 hover:bg-yellow-500 font-bold text-lg h-14 shadow-md"
                asChild
              >
                <a href="https://pf.kakao.com/_rXDin/chat" target="_blank" rel="noopener noreferrer" onClick={() => trackKakaoClick('hero')}>
                  <MessageCircle className="w-5 h-5 mr-2" /> 카카오톡 문의
                </a>
              </Button>
              <Button 
                className="w-full rounded-full bg-primary text-stone-900 hover:bg-primary/90 font-bold text-lg h-14 shadow-md"
                asChild
              >
                <a href="tel:010-4808-9382" onClick={() => trackPhoneClick('hero')}>
                  <Phone className="w-5 h-5 mr-2" /> 전화 상담 (010-4808-9382)
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/hero_bg_real.jpg" 
              alt="Background" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent"></div>
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block px-5 py-2 rounded-full bg-stone-900 text-white font-bold text-base mb-6 shadow-md">
                  ✨ 유치원 · 초등학교 방문 공연 전문 1위
                </span>
                <h1 className="text-5xl md:text-7xl font-heading font-bold text-stone-900 leading-tight mb-8 drop-shadow-sm">
                  아이들에게 <br/>
                  <span className="text-amber-600">잊지 못할 추억</span>을 <br/>
                  선물하세요
                </h1>
                <p className="text-xl md:text-2xl text-stone-800 mb-10 leading-relaxed font-medium max-w-2xl">
                  비버컴퍼니는 아이들의 눈높이에 맞춘 재미있고 교육적인 공연을 만듭니다. 
                  <span className="font-bold bg-yellow-200 px-1">검증된 전문가</span>가 찾아가는 안전한 공연을 약속드립니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="rounded-2xl text-xl h-16 px-10 bg-stone-900 text-white hover:bg-stone-800 shadow-lg transition-all transform hover:-translate-y-1 font-bold"
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    공연 문의하기 <ChevronRight className="ml-2 w-6 h-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-2xl text-xl h-16 px-10 border-2 border-stone-300 text-stone-700 hover:bg-white hover:border-stone-900 hover:text-stone-900 bg-white/80 backdrop-blur-sm font-bold">
                    프로그램 보기
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Video Gallery Section */}
        <section className="py-16 bg-stone-900 text-white overflow-hidden">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-primary font-bold tracking-wider uppercase text-base mb-2 block">Video Gallery</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                  영상으로 만나는 <br className="md:hidden" /> 비버컴퍼니
                </h2>
              </div>
              <Button variant="outline" className="rounded-full border-stone-700 text-stone-300 hover:bg-white hover:text-stone-900 h-12 px-6 text-lg" asChild>
                <a href="https://www.youtube.com/@%EB%B9%84%EB%B2%84%EC%84%A0%EC%83%9D%EB%8B%98-f9i" target="_blank" rel="noopener noreferrer">
                  유튜브 채널 바로가기 <ChevronRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredVideos.length > 0 ? featuredVideos.map((video) => (
                <div className="group" key={video.id}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02]">
                    <div className="aspect-video relative overflow-hidden bg-gray-900">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        loading="lazy"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-stone-600">
                        {video.description || '비버컴퍼니의 최신 공연 영상입니다.'}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 rounded-2xl border border-stone-700 bg-stone-800/60 p-8 text-center text-stone-300">
                  최신 YouTube 영상을 불러오는 중입니다.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="programs" className="py-24 bg-[#FEF9E7]">
          <div className="container">
            <div className="text-center mb-16">
              <span className="text-amber-600 font-bold tracking-wider uppercase text-base bg-amber-100 px-3 py-1 rounded-full">Our Programs</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 mt-4 mb-6">
                인기 공연 프로그램
              </h2>
              <p className="text-stone-700 max-w-2xl mx-auto text-xl leading-relaxed">
                아이들의 연령과 행사 성격에 딱 맞는 맞춤형 공연을 선택해보세요.
                <br className="hidden md:block" /> 모든 공연은 <strong>전문 교육을 이수한 공연자</strong>가 직접 진행합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white rounded-3xl">
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      <img 
                        src={program.image} 
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {program.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-stone-800 shadow-sm border border-stone-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-heading font-bold text-stone-900 mb-3 group-hover:text-amber-600 transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-stone-700 leading-relaxed mb-6 text-lg whitespace-pre-line">
                        {program.description}
                      </p>
                      <Button variant="ghost" className={`w-full rounded-xl font-bold text-lg h-12 ${program.color} hover:opacity-80`} onClick={() => { const el = document.getElementById('contact'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                        자세히 보기
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
             </div>
          </div>
        </section>

        {/* Trust Indicators - Critical for 4060 */}
        <section className="py-10 bg-white border-y border-stone-100 shadow-sm relative z-20">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-stone-100">
              {[
                { label: "누적 공연 횟수", value: "2,000회+", icon: "🏆" },
                { label: "관람 만족도", value: "99%", icon: "⭐" },
                { label: "재예약률", value: "85%", icon: "🔄" },
                { label: "누적 관람 인원", value: "50,000명+", icon: "👶" },
              ].map((stat, index) => (
                <div key={index} className="p-2">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-heading font-bold text-stone-900 mb-1">{stat.value}</div>
                  <div className="text-stone-600 font-bold text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Trust & Safety (Professional Update) */}
        <section id="about" className="py-24 bg-white rounded-t-[3rem] md:rounded-t-[5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.03)]">
          <div className="container">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 order-2 lg:order-1">
                <span className="text-blue-700 font-bold tracking-wider uppercase text-base bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Why Choose Us</span>
                <h2 className="text-4xl font-heading font-bold text-stone-900 mt-4 mb-8 leading-tight">
                  선생님, 기관들이 비버컴퍼니를 <br/>
                  <span className="text-blue-700">신뢰하는 이유</span>
                </h2>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "경험 많은 비버선생님의 직접 진행",
                      desc: "특정 공연은 경험과 재치가 넘치는 비버선생님이 직접 진행합니다. 아이들과의 소통에 탁월한 노하우로 매 공연을 특별하게 만들어 드립니다.",
                      icon: <ShieldCheck className="w-6 h-6 text-white" />,
                      bg: "bg-blue-600"
                    },
                    {
                      title: "검증된 베테랑 전문 선생님들",
                       desc: "다른 공연은 비버선생님이 인정하는 경험이 풍부한 전문 베테랑 선생님들이 진행합니다. 모두 오랜 현장 경험을 가진 검증된 전문가들입니다.",
                      icon: <Users className="w-6 h-6 text-white" />,
                      bg: "bg-amber-500"
                    },
                    {
                       title: "주요 활동지역: 대구 경북 광주 제주도 서울 어디든!",
                       desc: "대구, 경북, 광주, 제주도, 서울 등 전국 어디든 방문합니다. 거리에 상관없이 아이들이 있는 곳이라면 달려가겠습니다.",
                      icon: <MapPin className="w-6 h-6 text-white" />,
                      bg: "bg-green-600"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shadow-sm`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">{feature.title}</h3>
                        <p className="text-stone-700 leading-relaxed text-lg">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:w-1/2 order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-stone-100 rounded-[2rem] -z-10"></div>
                  <img 
                    src="/images/trust_reason_photo.png" 
                    alt="2025 한국어 말하기 대회 공연 현장" 
                    className="rounded-[1.5rem] shadow-xl w-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-stone-100 hidden md:block">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-stone-500 font-bold">공연자 신원 보증</div>
                        <div className="text-lg font-bold text-stone-900">100% 검증 완료</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section - Real Customer Reviews */}
        <section id="reviews" className="py-24 bg-[#F0F7FF]">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-heading font-bold text-stone-900 mb-6">
                생생한 이용 후기
              </h2>
              <p className="text-stone-700 text-xl">
                실제 고객님들이 보내주신 감사 메시지입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                { image: "/images/reviews/review1_gumi_hyeongnam.png", alt: "구미 형남초 후기" },
                { image: "/images/reviews/review2_gimcheon_hyodong.png", alt: "김천 효동어린이집 후기" },
                { image: "/images/reviews/review3_cheongdo_hwayang.png", alt: "청도 화양초 후기" },
                { image: "/images/reviews/review4_daegu_suchang.png", alt: "대구 수창초 후기" },
                { image: "/images/reviews/review5_daegu_sinheung.png", alt: "대구 신흥초 후기" },
                { image: "/images/reviews/review6_additional.png", alt: "고객 감사 메시지" },
              ].map((review, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <img 
                    src={review.image} 
                    alt={review.alt}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog/News Section (Crawling UI) */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <span className="text-blue-600 font-bold tracking-wider uppercase text-base mb-2 block">Beaver News</span>
                <h2 className="text-4xl font-heading font-bold text-stone-900">
                  비버컴퍼니 소식
                </h2>
              </div>
              <Button variant="ghost" className="text-stone-600 hover:text-stone-900 font-bold text-lg">
                블로그 전체보기 <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.length > 0 ? blogPosts.map((post, i) => (
                <a key={i} href={post.link} target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-100 hover:-translate-y-1">
                  {/* 썸네일 이미지 */}
                  {post.thumbnail ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnail)}`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white"><div class="text-6xl mb-3">🎭</div><span class="text-sm font-medium">블로그에서 확인하세요</span></div>';
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white">
                      <div className="text-6xl mb-3">🎭</div>
                      <span className="text-sm font-medium">블로그에서 확인하세요</span>
                    </div>
                  )}
                  
                  {/* 카드 내용 */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {new Date(post.pubDate).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        {post.category || "소식"}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-800 mb-2 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-stone-600 line-clamp-3 mb-3">
                      {post.description}
                    </p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                        <span>블로그에서 자세히 보기</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </a>
              )) : (
                // Fallback while loading
                [1, 2, 3].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                    <div className="aspect-[4/3] bg-stone-200"></div>
                    <div className="p-5">
                      <div className="flex justify-between mb-2">
                        <div className="w-16 h-5 bg-stone-200 rounded-full"></div>
                        <div className="w-16 h-5 bg-stone-200 rounded-full"></div>
                      </div>
                      <div className="w-full h-6 bg-stone-200 rounded mb-2"></div>
                      <div className="w-full h-16 bg-stone-200 rounded mb-3"></div>
                      <div className="w-24 h-4 bg-stone-200 rounded"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 함께한 파트너사 섹션 */}
        <section id="partners" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-base mb-2 block">Our Partners</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 mb-6">
                함께한 파트너사
              </h2>
              <p className="text-stone-700 max-w-2xl mx-auto text-xl">
                많은 기관과 기업이 비버컴퍼니와 함께하고 있습니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { year: "2025", count: "40+", partners: ["달성군 한국어 및 이중언어 말하기대회", "대구과학관 누리호발사기념 행사", "대구 동구육아종합지원센터"] },
                { year: "2024", count: "35+", partners: ["달서구가족센터", "대구남부특수교육지원청", "상주육아종합지원센터"] },
                { year: "2023", count: "42+", partners: ["대구시 출산장려의 날", "달성군 육아종합지원", "경상북도환경연수원"] },
                { year: "2022", count: "25+", partners: ["예천곳축제", "고령군 식습관개선", "대구예술고등학교"] },
                { year: "2021", count: "18+", partners: ["대구시청", "경북교육청", "달성군청"] },
                { year: "2020", count: "15+", partners: ["경북문화재단", "대구광역시", "상주시청"] },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                      <div className="text-xs text-gray-500 uppercase">Partners</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">{item.year}</div>
                  <div className="space-y-2">
                    {item.partners.map((partner, idx) => (
                      <div key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{partner}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 자주 묻는 질문 (FAQ) 섹션 */}
        <section id="faq" className="py-24 bg-amber-50/70">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-amber-600 font-bold tracking-wider uppercase text-base mb-2 block">FAQ</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 mb-6">
                  자주 묻는 질문
                </h2>
                <p className="text-stone-700 text-xl">
                  비버컴퍼니의 공연에 대해 자주 묻는 질문들을 모았습니다
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "신청은 어떻게 하나요?",
                    answer: "문자로 신청 가능합니다. 공연 종류, 원하는 날짜, 장소를 함께 보내주시면 빠르게 답변 드립니다."
                  },
                  {
                    question: "공연 시간은 얼마나 되나요?",
                    answer: "공연 종류에 따라 20~50분 정도 소요됩니다. 원하시는 시간에 맞춰 프로그램 구성도 가능합니다."
                  },
                  {
                    question: "강사나 배우는 누구인가요?",
                    answer: "전병규 선생님이 직접 진행합니다. 풍부한 경험과 전문성을 갖춘 강사진으로 안전하고 즐거운 공연을 선사합니다."
                  },
                  {
                    question: "장소는 어디든 가능한가요?",
                    answer: "네, 실내 야외 구분 없이 가능합니다. 일반아파트 거실정도 공간에서부터 대강당까지 다양한 장소에서 진행 가능합니다."
                  },
                  {
                    question: "비용은 어떻게 되나요?",
                    answer: "공연 날짜와 횟수, 지역에 따라 차이가 있습니다. 자세한 견적은 문의해 주시면 안내해 드립니다."
                  },
                  {
                    question: "공연 준비물은 있나요?",
                    answer: "저희가 모든 필요한 장비와 준비물을 가져옵니다. 고객님께서는 별도의 준비물 없이 편안하게 공연을 즐기시면 됩니다."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-stone-100"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 flex items-start">
                      <span className="text-amber-500 mr-3 flex-shrink-0">Q.</span>
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-stone-700 leading-relaxed pl-8">
                      <span className="text-blue-500 font-bold mr-2">A.</span>
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-stone-700 mb-4">
                  더 궁금한 점이 있으신가요? 언제든지 문의해 주세요.
                </p>
                <a 
                  href="#contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white font-bold rounded-full shadow-lg hover:bg-amber-700 transition-all duration-300 hover:scale-105"
                >
                  문의하기
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Enhanced for Leads */}
        <section id="contact" className="py-24 bg-white">
          <div className="container">
            <div className="bg-stone-900 rounded-[3rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="grid lg:grid-cols-2 gap-16 relative z-10">
                <div className="text-white flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 leading-tight">
                    공연 문의 및 <br/>
                    <span className="text-primary">예약 상담</span>
                  </h2>
                  <p className="text-stone-300 text-xl mb-12 leading-relaxed">
                    원하시는 공연 날짜와 내용을 남겨주시면 <br/>
                    담당자가 확인 후 <strong>1시간 이내</strong>에 연락드립니다.
                  </p>
                  
                  <div className="space-y-8 bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
                    <a href="tel:010-4808-9382" className="flex items-center gap-6 hover:opacity-80 transition-opacity" onClick={() => trackPhoneClick('contact_section')}>
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Phone className="w-7 h-7 text-stone-900" />
                      </div>
                      <div>
                        <div className="text-base text-stone-400 mb-1">빠른 전화 상담</div>
                        <div className="text-3xl font-bold text-white tracking-wide">010-4808-9382</div>
                      </div>
                    </a>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                        <MapPin className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="text-base text-stone-400 mb-1">주요 활동 지역</div>
                        <div className="text-xl font-bold text-white">대구 · 경북 · 광주 · 제주도 · 서울 어디든</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">간편 상담 신청</h3>
                    <p className="text-stone-600">정보를 남겨주시면 친절하게 안내해 드립니다.</p>
                  </div>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-base font-bold text-stone-800">이름 / 기관명 <span className="text-red-500">*</span></label>
                        <Input 
                          placeholder="예: 비버유치원" 
                          className="h-12 rounded-xl bg-stone-50 border-stone-200 text-lg" 
                          value={formData.organization}
                          onChange={(e) => setFormData({...formData, organization: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-base font-bold text-stone-800">연락처 <span className="text-red-500">*</span></label>
                        <Input 
                          placeholder="010-0000-0000" 
                          className="h-12 rounded-xl bg-stone-50 border-stone-200 text-lg" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-bold text-stone-800">희망 공연</label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-lg text-stone-700 cursor-pointer"
                        value={formData.performance}
                        onChange={(e) => setFormData({...formData, performance: e.target.value})}
                      >
                        <option>공연을 선택해주세요</option>
                        <option>인형극</option>
                        <option>마술쇼</option>
                        <option>버블쇼</option>
                        <option>솜사탕쇼</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-bold text-stone-800">희망 날짜</label>
                      <div className="relative">
                        <Input 
                          type="date" 
                          className="h-12 rounded-xl bg-stone-50 border-stone-200 text-lg" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                        <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-base font-bold text-stone-800">문의 내용</label>
                      <Textarea 
                        placeholder="궁금하신 점이나 요청사항을 적어주세요." 
                        className="rounded-xl bg-stone-50 border-stone-200 min-h-[140px] text-lg resize-none" 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                      />
                    </div>
                    {/* 개인정보 수집·이용 동의 */}
                    <div className="border border-stone-200 rounded-xl bg-stone-50 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="privacy-agree"
                          checked={privacyAgreed}
                          onChange={(e) => setPrivacyAgreed(e.target.checked)}
                          className="mt-1 w-5 h-5 accent-stone-900 cursor-pointer flex-shrink-0"
                        />
                        <label htmlFor="privacy-agree" className="text-sm font-bold text-stone-800 cursor-pointer leading-relaxed">
                          <span className="text-red-500">[필수]</span> 개인정보 수집·이용에 동의합니다
                        </label>
                      </div>
                      {/* 개인정보 처리 요약 */}
                      <div className="ml-8 text-xs text-stone-600 space-y-1.5">
                        <div className="flex gap-2">
                          <span className="font-bold text-stone-700 flex-shrink-0">① 수집·이용 목적</span>
                          <span>공연 상담 및 예약 안내, 문의 답변</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold text-stone-700 flex-shrink-0">② 수집 항목</span>
                          <span>이름/기관명, 연락처, 희망 공연, 희망 날짜, 문의 내용</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold text-stone-700 flex-shrink-0">③ 보유·이용 기간</span>
                          <span>상담 완료 후 1년간 보유 후 파기</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold text-stone-700 flex-shrink-0">④ 동의 거부 권리</span>
                          <span>동의를 거부할 권리가 있으나, 거부 시 상담 신청이 제한됩니다.</span>
                        </div>
                      </div>
                      {/* 전문 펼쳐보기 */}
                      <div className="ml-8">
                        <button
                          type="button"
                          onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                          className="text-xs text-amber-700 underline hover:text-amber-900 font-medium"
                        >
                          {showPrivacyDetail ? '▲ 개인정보처리방침 접기' : '▼ 개인정보처리방침 전문 보기'}
                        </button>
                        {showPrivacyDetail && (
                          <div className="mt-2 p-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 leading-relaxed space-y-2 max-h-40 overflow-y-auto">
                            <p className="font-bold text-stone-800">개인정보 수집·이용 동의서</p>
                            <p>비버컴퍼니(이하 '회사')는 개인정보보호법 제15조 제2항에 따라 아래와 같이 개인정보를 수집·이용합니다.</p>
                            <p><strong>1. 수집·이용 목적</strong><br/>공연 상담 및 예약 안내, 문의 답변, 서비스 제공을 위한 연락</p>
                            <p><strong>2. 수집하는 개인정보 항목</strong><br/>이름/기관명, 연락처(전화번호), 희망 공연 종류, 희망 날짜, 문의 내용</p>
                            <p><strong>3. 보유 및 이용 기간</strong><br/>상담 완료 후 1년간 보유 후 안전하게 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보존합니다.</p>
                            <p><strong>4. 동의 거부 권리 및 불이익</strong><br/>귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 동의를 거부하실 경우 상담 신청 서비스 이용이 제한됩니다.</p>
                            <p className="text-stone-500">문의: 010-4808-9382 | 비버컴퍼니</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className={`w-full h-14 rounded-xl font-bold text-xl shadow-lg mt-2 transition-all ${
                        privacyAgreed
                          ? 'bg-stone-900 text-white hover:bg-stone-800'
                          : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      }`}
                      disabled={submitConsultation.isPending || !privacyAgreed}
                    >
                      상담 신청하기
                    </Button>
                    <p className="text-center text-stone-500 text-sm mt-4">
                      개인정보는 상담 목적으로만 사용됩니다.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-3xl font-heading font-bold text-white mb-6">비버컴퍼니</div>
              <p className="leading-relaxed mb-6">
                아이들에게 꿈과 희망을 심어주는 <br/>
                최고의 공연 파트너가 되겠습니다.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Placeholders */}
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-primary hover:text-stone-900 transition-colors cursor-pointer">B</div>
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-primary hover:text-stone-900 transition-colors cursor-pointer">I</div>
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-primary hover:text-stone-900 transition-colors cursor-pointer">Y</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">바로가기</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="hover:text-primary transition-colors">홈</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">회사 소개</a></li>
                <li><a href="#programs" className="hover:text-primary transition-colors">공연 프로그램</a></li>
                <li><a href="#reviews" className="hover:text-primary transition-colors">이용 후기</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">공연 프로그램</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-primary transition-colors">찾아가는 인형극</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">신기한 마술쇼</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">버블쇼 & 풍선아트</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">캐릭터 솜사탕쇼</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">고객센터</h4>
              <div className="text-3xl font-bold text-white mb-2">010-4808-9382</div>
              <p className="text-sm mb-4">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
              <Button 
                variant="outline" 
                className="rounded-full border-stone-700 text-stone-300 hover:bg-white hover:text-stone-900"
                asChild
              >
                <a href="https://pf.kakao.com/_rXDin/chat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" onClick={() => trackKakaoClick('footer')}>
                  <MessageCircle className="w-5 h-5" />
                  1:1 카카오톡 상담
                </a>
              </Button>
            </div>
          </div>
          
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div>
              <span className="mr-4">대표: 전병규</span>
              <span className="mr-4">사업자등록번호: 545-94-01516</span>
              <span>주소: 대구광역시 동구 신암로20길 63</span>
            </div>
            <div>© 2025 Beaver Company. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 CTA 버튼 */}
      <MobileBottomCTA />
    </div>
  );
}
