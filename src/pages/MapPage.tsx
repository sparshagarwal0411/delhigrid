import { Layout } from "@/components/Layout";
import { DelhiMap } from "@/components/DelhiMap";

const MapPage = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Delhi Ward Map</h1>
          <p className="text-muted-foreground">
            Explore pollution data across all 250 wards of Delhi. Click on any ward to view detailed information.
          </p>
        </div>
        
        <DelhiMap />
      </div>
    </Layout>
  );
};

export default MapPage;
