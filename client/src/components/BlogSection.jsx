import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const BlogSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();
    const t = translations[language].blog;

    useEffect(() => {
        fetch('http://localhost:5000/api/blog')
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching blogs:", err);
                setLoading(false);
            });
    }, []);

    return (
        <section id="blog" className="py-24 bg-darker-bg">
            <div className="container mx-auto px-8">
                <h2 className="section-title">{t.title}</h2>
                <p className="section-subtitle">{t.subtitle}</p>

                {loading ? (
                    <div className="text-center text-primary-gold">{t.loading}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <div key={post.id} className="glass-card !p-0 overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-text-dim">
                                    Blog Image Placeholder
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-primary-gold mb-2">
                                        {post.date}
                                    </div>
                                    <h3 className="mb-4 text-xl font-semibold">{post.title}</h3>
                                    <p className="text-text-dim text-sm mb-6">
                                        {post.excerpt}
                                    </p>
                                    <a href="#" className="text-primary-gold font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                        {t.readMore}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BlogSection;
