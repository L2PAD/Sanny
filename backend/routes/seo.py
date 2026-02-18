"""
SEO routes - sitemap.xml, robots.txt
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from datetime import datetime, timezone
import os
import logging

from database import db
from config import SITE_URL

logger = logging.getLogger(__name__)
router = APIRouter(tags=["SEO"])


@router.get("/sitemap.xml", response_class=Response)
async def get_sitemap():
    """Generate XML sitemap for SEO"""
    try:
        products = await db.products.find({}, {"_id": 0, "id": 1, "updated_at": 1}).to_list(1000)
        categories = await db.categories.find({}, {"_id": 0, "id": 1, "updated_at": 1}).to_list(1000)
        
        site_url = SITE_URL
        
        xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        
        # Homepage
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{site_url}/</loc>\n'
        xml_content += '    <changefreq>daily</changefreq>\n'
        xml_content += '    <priority>1.0</priority>\n'
        xml_content += '  </url>\n'
        
        # Categories
        for category in categories:
            xml_content += '  <url>\n'
            xml_content += f'    <loc>{site_url}/products?category_id={category["id"]}</loc>\n'
            xml_content += '    <changefreq>weekly</changefreq>\n'
            xml_content += '    <priority>0.8</priority>\n'
            xml_content += '  </url>\n'
        
        # Products
        for product in products:
            last_mod = product.get('updated_at', datetime.now(timezone.utc))
            if isinstance(last_mod, str):
                last_mod = datetime.fromisoformat(last_mod.replace('Z', '+00:00'))
            
            xml_content += '  <url>\n'
            xml_content += f'    <loc>{site_url}/product/{product["id"]}</loc>\n'
            xml_content += f'    <lastmod>{last_mod.strftime("%Y-%m-%d")}</lastmod>\n'
            xml_content += '    <changefreq>weekly</changefreq>\n'
            xml_content += '    <priority>0.9</priority>\n'
            xml_content += '  </url>\n'
        
        xml_content += '</urlset>'
        
        return Response(content=xml_content, media_type="application/xml")
    
    except Exception as e:
        logger.error(f"Error generating sitemap: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate sitemap")


@router.get("/robots.txt", response_class=Response)
async def get_robots_txt():
    """Generate robots.txt for search engines"""
    site_url = SITE_URL
    
    robots_content = f"""User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /cart

# Sitemap
Sitemap: {site_url}/api/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1
"""
    
    return Response(content=robots_content, media_type="text/plain")
