import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import sys

# Set paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Fixed path to point to ml-backend
OLD_MODELS_DIR = os.path.join(BASE_DIR, 'ml/backend/prediction_models')
NEW_MODELS_DIR = os.path.join(BASE_DIR, 'retrained_models')

def load_metrics(model_dir, species):
    """Load metrics from the specified model directory for a given species"""
    metrics_path = os.path.join(model_dir, species.lower(), 'metrics.json')
    
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error parsing metrics file for {species} in {model_dir}: {str(e)}")
            return None
        except Exception as e:
            print(f"Error loading metrics for {species} in {model_dir}: {str(e)}")
            return None
    else:
        print(f"No metrics found for {species} in {model_dir}")
        return None

def compare_models():
    """Compare old and new models for each species"""
    # Species to compare
    species_list = ['Cat', 'Dog', 'Hamster', 'Rabbit']
    
    # Metrics to compare
    metrics_to_compare = ['accuracy', 'precision', 'recall', 'f1_score']
    
    # Create a DataFrame to store comparison results
    comparison_data = []
    
    # Check if new models exist
    if not os.path.exists(NEW_MODELS_DIR):
        print(f"New models directory not found: {NEW_MODELS_DIR}")
        print("Please run the retraining script first.")
        return pd.DataFrame()  # Return empty DataFrame
    
    # Check if old models exist
    old_models_exist = os.path.exists(OLD_MODELS_DIR)
    if not old_models_exist:
        print(f"Old models directory not found: {OLD_MODELS_DIR}")
        print("Will only report metrics for new models.")
    
    # Flag to track if we have any comparison data
    has_comparison_data = False
    
    for species in species_list:
        # Always try to load new metrics
        new_metrics = load_metrics(NEW_MODELS_DIR, species)
        
        if not new_metrics:
            print(f"Skipping {species} - no new metrics available")
            continue
        
        # If old models directory exists, try to load old metrics
        old_metrics = None
        if old_models_exist:
            old_metrics = load_metrics(OLD_MODELS_DIR, species)
        
        # If we have new metrics, add them to the comparison data
        for metric in metrics_to_compare:
            if metric in new_metrics:
                data_row = {
                    'Species': species,
                    'Metric': metric,
                    'New Model': new_metrics[metric]
                }
                
                # Add old model data if available
                if old_metrics and metric in old_metrics:
                    data_row['Old Model'] = old_metrics[metric]
                    data_row['Improvement'] = new_metrics[metric] - old_metrics[metric]
                else:
                    data_row['Old Model'] = None
                    data_row['Improvement'] = None
                
                comparison_data.append(data_row)
                has_comparison_data = True
    
    # Convert to DataFrame
    comparison_df = pd.DataFrame(comparison_data)
    
    # Print comparison table
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    
    if has_comparison_data:
        print("\nModel Performance Comparison:")
        print(comparison_df)
        
        # Plot comparison if we have both old and new metrics
        if 'Old Model' in comparison_df.columns and not comparison_df['Old Model'].isnull().all():
            plot_comparison(comparison_df, metrics_to_compare)
        else:
            # Just plot new model metrics
            plot_new_model_metrics(comparison_df, metrics_to_compare)
    else:
        print("\nNo comparison data available.")
    
    return comparison_df

def plot_comparison(comparison_df, metrics_to_compare):
    """Plot comparison between old and new models"""
    plt.figure(figsize=(15, 10))
    
    for i, metric in enumerate(metrics_to_compare):
        # Skip if we don't have data for this metric
        if not any(comparison_df['Metric'] == metric):
            continue
            
        plt.subplot(2, 2, i+1)
        metric_data = comparison_df[comparison_df['Metric'] == metric]
        
        # Create a grouped bar chart
        x = range(len(metric_data))
        width = 0.35
        
        # Only plot old model if we have data
        if not metric_data['Old Model'].isnull().all():
            plt.bar(x, metric_data['Old Model'], width, label='Old Model')
            plt.bar([i + width for i in x], metric_data['New Model'], width, label='New Model')
        else:
            # Just plot new model
            plt.bar(x, metric_data['New Model'], width, label='New Model')
        
        plt.xlabel('Species')
        plt.ylabel(metric.capitalize())
        plt.title(f'{metric.capitalize()} Comparison')
        plt.xticks([i + (width/2 if not metric_data['Old Model'].isnull().all() else 0) for i in x], 
                  metric_data['Species'])
        plt.legend()
    
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'model_comparison.png'))
    plt.close()
    
    print(f"Comparison plot saved to {os.path.join(BASE_DIR, 'model_comparison.png')}")

def plot_new_model_metrics(comparison_df, metrics_to_compare):
    """Plot metrics for new models only"""
    plt.figure(figsize=(15, 10))
    
    # Group by species and create a bar chart for each metric
    species_list = comparison_df['Species'].unique()
    
    for i, metric in enumerate(metrics_to_compare):
        # Skip if we don't have data for this metric
        if not any(comparison_df['Metric'] == metric):
            continue
            
        plt.subplot(2, 2, i+1)
        
        # Filter data for this metric
        metric_data = comparison_df[comparison_df['Metric'] == metric]
        
        # Create bar chart
        sns.barplot(x='Species', y='New Model', data=metric_data)
        
        plt.xlabel('Species')
        plt.ylabel(metric.capitalize())
        plt.title(f'{metric.capitalize()} - New Models')
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'new_model_metrics.png'))
    plt.close()
    
    print(f"New model metrics plot saved to {os.path.join(BASE_DIR, 'new_model_metrics.png')}")

def main():
    try:
        comparison_df = compare_models()
        
        # If we have comparison data, save it to CSV
        if not comparison_df.empty:
            csv_path = os.path.join(BASE_DIR, 'model_comparison.csv')
            comparison_df.to_csv(csv_path, index=False)
            print(f"Comparison data saved to {csv_path}")
    except Exception as e:
        print(f"Error in model comparison: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()