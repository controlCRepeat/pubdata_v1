import { useEffect, useRef } from 'react';

export default function TableauEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    script.async = true;
    document.body.appendChild(script);

    // Add resize handler to adjust height
    const handleResize = () => {
      if (containerRef.current) {
        const vizElement = containerRef.current.getElementsByTagName('object')[0];
        if (vizElement) {
          vizElement.style.width = '100%';
          vizElement.style.height = '100%';
          vizElement.style.overflow = 'hidden';
        }
      }
    };

    // Initial size and add resize listener
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-semibold mb-2">Number of Households</h2>
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            ref={containerRef} 
            className='tableauPlaceholder' 
            id='viz1748596784763' 
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <noscript>
              <a href='#'>
                <img 
                  alt=' ' 
                  src='https://public.tableau.com/static/images/Op/OpenGovData/NumberofHouseholds/1_rss.png' 
                  style={{ border: 'none' }} 
                />
              </a>
            </noscript>
            <object 
              className='tableauViz' 
              style={{ 
                display: 'none', 
                width: '100%', 
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
              <param name='embed_code_version' value='3' />
              <param name='site_root' value='' />
              <param name='name' value='OpenGovData/NumberofHouseholds' />
              <param name='tabs' value='yes' />
              <param name='toolbar' value='yes' />
              <param name='static_image' value='https://public.tableau.com/static/images/Op/OpenGovData/NumberofHouseholds/1.png' />
              <param name='animate_transition' value='yes' />
              <param name='display_static_image' value='yes' />
              <param name='display_spinner' value='yes' />
              <param name='display_overlay' value='yes' />
              <param name='display_count' value='yes' />
              <param name='language' value='en-GB' />
            </object>
          </div>
        </div>
      </div>
    </div>
  );
} 